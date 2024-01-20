import { publicProcedure, router } from "../lib/trpc";
import { z } from "zod";
import { db } from "../db/db";
import { eq } from "drizzle-orm";

import {
  donations,
  selectDonationSchema,
} from "ghommerce-schema/src/db/donations";

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
});
