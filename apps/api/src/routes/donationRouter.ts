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
  invoices,
  selectInvoiceSchema,
} from "ghommerce-schema/src/db/invoices.db";

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
        donationId: z.string().uuid().optional(),
        option: z.number().optional(), // TODO add params as needed
        email: z.string().email().optional(), // TODO add params as needed
      }),
    )
    .output(InvoiceSchema)
    .query(async ({ input, ctx }) => {
      if (!input?.donationId) throw new Error("Invalid donationId");
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

      // TOOD create invoice

      // TODO create enttiy in invoiceToDonation table

      // return invoice

      return InvoiceSchema.parse({});
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
