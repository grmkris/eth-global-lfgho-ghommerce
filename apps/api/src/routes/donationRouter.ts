import { authProcedure, publicProcedure, router } from "../lib/trpc";
import { z } from "zod";
import { db } from "../db/db";
import { eq } from "drizzle-orm";
import {
  DonationDataSchema,
  donations,
  selectDonationSchema,
} from "ghommerce-schema/src/db/donations.db";
import { InvoiceSchema } from "ghommerce-schema/src/api/invoice.api.schema";

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
});
