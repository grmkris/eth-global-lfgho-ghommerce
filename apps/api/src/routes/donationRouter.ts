import { authProcedure, publicProcedure, router } from "../lib/trpc";
import { z } from "zod";
import { db } from "../db/db";
import { and, eq } from "drizzle-orm";
import {
  DonationDataSchema,
  donations,
  selectDonationSchema,
} from "ghommerce-schema/src/db/donations.db";
import { InvoiceSchema } from "ghommerce-schema/src/api/invoice.api.schema";
import {
  insertInvoiceSchema,
  invoices,
  selectInvoiceSchema,
} from "ghommerce-schema/src/db/invoices.db";
import { ERC20_TOKEN_MAPPER } from "ghommerce-schema/src/tokens.schema";
import { invoiceToDonation } from "ghommerce-schema/src/db/invoiceToDonation.db";

export const donationRouter = router({
  getDonation: publicProcedure
    .input(
      z.object({
        donationId: z.string().uuid().optional(),
      }),
    )
    .output(selectDonationSchema)
    .query(async ({ input, ctx }) => {
      if (!input?.donationId) throw new Error("Invalid storeId");
      const result = await db.query.donations.findFirst({
        where: eq(donations.id, input.donationId),
        with: {
          store: {
            with: {
              safe: true,
            },
          },
        },
      });

      return selectDonationSchema.parse(result);
    }),
  createDonation: authProcedure
    .input(
      z.object({
        storeId: z.string().uuid().optional(),
        donationData: DonationDataSchema,
      }),
    )
    .output(selectDonationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!input?.storeId) throw new Error("Invalid storeId");
      if (!ctx.session?.user?.id) throw new Error("Invalid user");
      const result = await db
        .insert(donations)
        .values({
          userId: ctx.session.user.id,
          storeId: input.storeId,
          donationData: input.donationData,
        })
        .returning()
        .execute();
      return result[0];
    }),
  createDonationInvoice: publicProcedure
    .input(
      z.object({
        donationId: z.string().uuid(),
        amount: z.number(), // TODO add params as needed
        email: z.string().email().optional(), // TODO add params as needed
      }),
    )
    .output(selectInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      if (!input?.donationId) throw new Error("Invalid donationId");
      const donation = await db.query.donations.findFirst({
        where: eq(donations.id, input.donationId),
        with: {
          store: true,
        },
      });

      if (!donation?.storeId) throw new Error("Invalid donation");
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const invoice = await db
        .insert(invoices)
        .values(
          insertInvoiceSchema.parse({
            description: donation.donationData.description,
            storeId: donation.storeId,
            status: "pending",
            dueDate: dueDate,
            amountDue: input.amount,
            currency: "USD",
            acceptedTokens:
              ERC20_TOKEN_MAPPER[
                donation.store.isTestnet ? "testnet" : "mainnet"
              ].USDT,
          } satisfies insertInvoiceSchema),
        )
        .returning()
        .execute();

      // TODO create enttiy in invoiceToDonation table
      if (!invoice[0].id) throw new Error("Invalid invoice");
      if (!donation?.id) throw new Error("Invalid donation");

      const invoiceToDonationResult = await db
        .insert(invoiceToDonation)
        .values({
          invoiceId: invoice[0].id,
          donationId: donation.id,
        })
        .returning()
        .execute();

      // return invoice

      return selectInvoiceSchema.parse(invoice[0]);
    }),

  getDonations: authProcedure
    .input(
      z
        .object({
          storeId: z.string().uuid().optional(),
        })
        .optional(),
    )
    .output(z.array(selectDonationSchema))
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Unauthorized");
      if (!input?.storeId) {
        // return all stores for user
        const result = await db.query.donations.findMany({
          where: and(eq(donations.userId, ctx.session.user.id)),
          with: {
            store: true,
          },
        });
        return result;
      }
      return await db.query.donations.findMany({
        where: and(
          eq(donations.storeId, input.storeId),
          eq(donations.userId, ctx.session.user.id),
        ),
        with: {
          store: true,
        },
      });
    }),

  getDonationInvoices: authProcedure
    .input(
      z.object({
        donationId: z.string().uuid(),
      }),
    )
    .output(z.array(selectInvoiceSchema))
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user?.id) throw new Error("Unauthorized");
      const store = await db.query.donations.findFirst({
        where: and(
          eq(donations.id, input.donationId),
          eq(donations.userId, ctx.session.user.id),
        ),
        with: {
          store: true,
        },
      });
      if (!store) throw new Error("Unauthorized");
      const result = await db.query.invoices.findMany({
        where: eq(invoices.storeId, store.storeId),
        with: {
          store: true,
        },
      });

      return result;
    }),
});
