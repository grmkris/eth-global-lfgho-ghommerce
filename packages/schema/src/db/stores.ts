import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { invoices } from "./invoices.ts";
import { safes, selectSafeSchema } from "./safes.ts";
import { users } from "./users.ts";
import { donations } from "./donations.ts";

export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  safeId: uuid("safe_id")
    .notNull()
    .references(() => safes.id),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});
export const selectStoreSchema = createSelectSchema(stores, {
  createdAt: () => z.coerce.date().default(new Date()),
  updatedAt: () => z.coerce.date().default(new Date()),
}).extend({
  safe: selectSafeSchema.optional(),
});

export const insertStoreSchema = createInsertSchema(stores, {
  name: z.string(),
  description: z.string(),
  createdAt: () => z.coerce.date().default(new Date()),
}).omit({ userId: true, updatedAt: true, createdAt: true });

export const storesRelations = relations(stores, ({ many, one }) => ({
  invoices: many(invoices),
  donations: many(donations),
  user: one(users, {
    fields: [stores.userId],
    references: [users.id],
  }),
  safe: one(safes, {
    fields: [stores.safeId],
    references: [safes.id],
  }),
}));

export type selectStoreSchema = z.infer<typeof selectStoreSchema>;

export type insertStoreSchema = z.infer<typeof insertStoreSchema>;
