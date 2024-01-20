import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.db.ts";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { selectStoreSchema, stores } from "./stores.db.ts";
import { relations } from "drizzle-orm";
import { payments } from "./payments.db.ts";
import { invoices } from "./invoices.db.ts";
import { invoiceToDonation } from "./invoiceToDonation.db.ts";

export const DonationDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  options: z.array(
    z.object({
      amount: z.coerce.number(),
      description: z.string(),
    }),
  ),
});

export type DonationData = z.infer<typeof DonationDataSchema>;

export const donations = pgTable("donations", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  donationData: jsonb("donation_data").notNull().$type<DonationData>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const selectDonationSchema = createSelectSchema(donations, {
  createdAt: () => z.coerce.date().default(new Date()),
  updatedAt: () => z.coerce.date().default(new Date()),
  donationData: DonationDataSchema,
}).extend({
  store: selectStoreSchema.optional(),
});

export type selectDonationSchema = z.infer<typeof selectDonationSchema>;

export const donationRelations = relations(donations, ({ many, one }) => ({
  invoiceToDonation: many(invoiceToDonation),
  store: one(stores, {
    fields: [donations.storeId],
    references: [stores.id],
  }),
}));

export const insertDonationSchema = createInsertSchema(donations, {
  donationData: DonationDataSchema,
  createdAt: () => z.coerce.date().default(new Date()),
}).omit({ userId: true, updatedAt: true, createdAt: true });
