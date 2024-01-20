import { publicProcedure, router } from "../lib/trpc";
import { z } from "zod";
import { db } from "../db/db";
import { eq } from "drizzle-orm";
import {
  donations,
  selectDonationSchema,
} from "ghommerce-schema/src/db/donations.db";
import {selectInvoiceSchema} from "ghommerce-schema/src/db/invoices.db";
import {InvoiceSchema} from "ghommerce-schema/src/api/invoice.api.schema";

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
