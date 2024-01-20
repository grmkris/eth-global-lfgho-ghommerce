import { authProcedure, publicProcedure, router } from "../lib/trpc";
import { z } from "zod";
import { db } from "../db/db";
import { and, desc, eq } from "drizzle-orm";
import {
  insertInvoiceSchema,
  invoices,
  PayerInformationSchema,
  selectInvoiceSchema,
} from "ghommerce-schema/src/db/invoices.db";
import { TransactionHash } from "ghommerce-schema/src/address.schema";
import {
  insertPaymentSchema,
  payments,
  selectPaymentSchema,
} from "ghommerce-schema/src/db/payments.db";
import {
  TokenAmountSchema,
  TokenSchema,
  ZERO_ADDRESS,
} from "ghommerce-schema/src/tokens.schema";
import { CovalentClient } from "@covalenthq/client-sdk";
import { ChainIdToName } from "ghommerce-schema/src/chains.schema";
import { InvoiceSchema } from "ghommerce-schema/src/api/invoice.api.schema";

export const invoiceRouter = router({
  getInvoice: publicProcedure
    .input(
      z.object({
        invoiceId: z.string().uuid().optional(),
      }),
    )
    .output(InvoiceSchema)
    .query(async ({ input, ctx }) => {
      if (!input?.invoiceId) throw new Error("Invalid storeId");
      const result = await db.query.invoices.findFirst({
        where: eq(invoices.id, input.invoiceId),
        with: {
          store: {
            with: {
              safe: true,
            },
          },
        },
      });
      if (!result) throw new Error("Invoice not found");

      const client = new CovalentClient("cqt_rQg66wvckMDgfbm3C3X8XFJGPRTP"); // Replace with your Covalent API key.

      const tokens = result.acceptedTokens?.map(async (token) => {
        const tokenData = await client.PricingService.getTokenPrices(
          ChainIdToName[token.chainId],
          "USD", // TODO: get quote currency from 'currency
          token.address,
        );
        return {
          ...token,
          priceUSD: (tokenData.data[0].prices[0].price ?? 1).toString(), // TODO /1 is a hack to get around testnet tokens not having a price
          chainId: token.chainId,
          address: token.address,
          symbol: tokenData.data[0].contract_ticker_symbol,
          name: tokenData.data[0].contract_name,
          logoURI: tokenData.data[0].logo_url,
          decimals: tokenData.data[0].contract_decimals,
          chain: {
            // TODO this is incorrect
            id: token.chainId,
            logoURI: tokenData.data[0].logo_url,
            name: ChainIdToName[token.chainId],
            isTestnet: false,
            displayName: ChainIdToName[token.chainId],
          },
        } satisfies TokenSchema;
      });

      return {
        id: result.id,
        description: result.description,
        currency: result.currency,
        acceptedTokens: await Promise.all(tokens),
        dueDate: z.coerce.date().optional().parse(result.dueDate),
        amountDue: result.amountDue,
        status: result.status,
        isTestnet: result.store.isTestnet,
        payer: {
          payerEmail: result.payerEmail,
          payerWallet: result.payerWallet ?? undefined,
          payerName: result.payerName,
        },
        store: {
          name: result.store.name,
          description: result.store.description,
          wallet: result.store.safe.address,
        },
      } satisfies InvoiceSchema;
    }),

  getInvoices: authProcedure
    .input(
      z.object({
        storeId: z.string().uuid().optional(),
      }),
    )
    .output(z.array(selectInvoiceSchema))
    .query(async ({ input, ctx }) => {
      if (!input?.storeId) throw new Error("Invalid storeId");
      const result = await db.query.invoices.findMany({
        where: eq(invoices.storeId, input.storeId),
        with: {
          store: {
            with: {
              safe: true,
            },
          },
        },
        orderBy: (invoices) => desc(invoices.createdAt),
      });

      return selectInvoiceSchema.array().parse(result);
    }),

  createInvoice: authProcedure
    .input(insertInvoiceSchema)
    .output(selectInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Unauthorized");
      const newInvoice = await db
        .insert(invoices)
        .values(input)
        .returning()
        .execute();
      return selectInvoiceSchema.parse(newInvoice[0]);
    }),

  // function called from frontend to update data entered by the payer
  updatePayerData: publicProcedure
    .input(
      z.object({
        invoiceId: z.string().uuid(),
        payerData: PayerInformationSchema,
      }),
    )
    .output(selectInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      if (!input?.invoiceId) throw new Error("Invalid invoiceId");
      const result = await db
        .update(invoices)
        .set(input.payerData)
        .where(eq(invoices.id, input.invoiceId))
        .returning()
        .execute();
      return selectInvoiceSchema.parse(result[0]);
    }),

  // function called from frontend to attach a payment to an invoice from the payer
  recordPayment: publicProcedure
    .input(
      z.object({
        invoiceId: z.string().uuid(),
        transactionHash: TransactionHash,
        fromToken: TokenAmountSchema,
        toToken: TokenAmountSchema,
      }),
    )
    .output(selectPaymentSchema)
    .mutation(async ({ input, ctx }) => {
      if (!input?.invoiceId) throw new Error("Invalid invoiceId");
      // TODO: check if txHash is correct and that amounts match
      // transaction hash should be located in the blockchain of the toToken

      const existingPayment = await db.query.payments.findFirst({
        where: and(
          eq(payments.invoiceId, input.invoiceId),
          eq(payments.transactionHash, input.transactionHash),
        ),
      });

      if (existingPayment) throw new Error("Payment already exists");

      const payment = await db
        .insert(payments)
        .values({
          invoiceId: input.invoiceId,
          transactionHash: input.transactionHash,
          fromToken: input.fromToken,
          toToken: input.toToken,
          token: {
            address: ZERO_ADDRESS, // TODO: get token address from transactionHash
            priceUSD: "1", // TODO: get token price from transactionHash
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
            chainId: 1,
            logoURI:
              "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
            amount: "1",
            updated_at: new Date(),
            chain: {
              id: 1,
              logoURI:
                "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
              name: "eth-mainnet",
              isTestnet: false,
              displayName: "Ethereum",
            },
          },
          paymentMethod: "wallet",
        } as insertPaymentSchema)
        .returning()
        .execute();

      const updatedInvoiceStatus = await db
        .update(invoices)
        .set({ status: "paid" })
        .where(eq(invoices.id, input.invoiceId))
        .returning()
        .execute();

      return selectPaymentSchema.parse(payment[0]);
    }),
});
