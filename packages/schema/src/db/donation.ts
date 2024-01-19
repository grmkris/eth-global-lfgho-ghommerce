import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.ts";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { selectStoreSchema, stores } from "./stores.ts";

export const donations = pgTable("donations", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  donationData: jsonb("donation_data").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const DonationDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  options: z.array(
    z.object({
      amount: z.number(),
      description: z.string(),
    })
  ),
});

export const selectDonationSchema = createSelectSchema(donations, {
  createdAt: () => z.coerce.date().default(new Date()),
  updatedAt: () => z.coerce.date().default(new Date()),
  donationData: DonationDataSchema,
}).extend({
  store: selectStoreSchema,
});

export const insertDonationSchema = createInsertSchema(donations, {
  donationData: DonationDataSchema,
  createdAt: () => z.coerce.date().default(new Date()),
}).omit({ userId: true, updatedAt: true, createdAt: true });
