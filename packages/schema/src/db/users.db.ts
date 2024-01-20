import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { eoas, safes } from "./safes.db.ts";
import { stores } from "./stores.db.ts";

/**
 * Customer entity is used to store the Customer information
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const selectUser = createSelectSchema(users, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export const insertUser = createInsertSchema(users);
export const updateUser = insertUser
  .omit({
    id: true,
    createdAt: true,
  })
  .partial();
export type selectUser = z.infer<typeof selectUser>;
export type insertUser = z.infer<typeof updateUser>;
export type updateUser = z.infer<typeof insertUser>;

export const userRelations = relations(users, ({ many }) => ({
  /** customer data */
  wallets: many(eoas),
  safes: many(safes),
  stores: many(stores),
}));
