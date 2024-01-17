import { authProcedure, publicProcedure, router } from "../lib/trpc";
import { z } from "zod";
import { db } from "../db/db";
import { eq } from "drizzle-orm";
import {
  insertInvoiceSchema,
  invoices,
  PayerInformationSchema,
  selectInvoiceSchema,
} from "ghommerce-schema/src/db/invoices";
import { Address, TransactionHash } from "ghommerce-schema/src/address.schema";
import {
  insertPaymentSchema,
  payments,
  selectPaymentSchema,
} from "ghommerce-schema/src/db/payments";
import { ZERO_ADDRESS } from "ghommerce-schema/src/tokens.schema";

export const invoiceRouter = router({
  getInvoice: publicProcedure
    .input(
      z.object({
        invoiceId: z.string().uuid().optional(),
      }),
    )
    .output(selectInvoiceSchema)
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

      return selectInvoiceSchema.parse(result);
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
      }),
    )
    .output(selectPaymentSchema)
    .mutation(async ({ input, ctx }) => {
      if (!input?.invoiceId) throw new Error("Invalid invoiceId");
      const payment = await db
        .insert(payments)
        .values({
          invoiceId: input.invoiceId,
          transactionHash: input.transactionHash,
          amountPaid: 1,
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
      return selectPaymentSchema.parse(payment);
    }),
});
