import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { Address } from "../address.schema.ts";
import { users } from "./users.ts";

/**
 * Customer entity can have multiple wallets, this table is used to store the relation between Customer and wallet
 */
export const eoas = pgTable("eoas", {
  id: uuid("id").primaryKey().defaultRandom(),
  wallet: text("wallet").notNull(),
  nonce: text("nonce").notNull(),
  verified: boolean("verified").notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const selectEoaSchema = createSelectSchema(eoas, {
  wallet: Address,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export const insertEoaSchema = createInsertSchema(eoas, {
  wallet: Address,
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export type selectEoaSchema = z.infer<typeof selectEoaSchema>;
export type insertEoaSchema = z.infer<typeof insertEoaSchema>;

export const safes = pgTable("safes", {
  id: uuid("id").primaryKey().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  nonce: text("nonce").notNull(),
  address: text("address").notNull(),
  predicted: boolean("predicted").notNull(),
  threshold: bigint("threshold", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const insertSafeSchema = createInsertSchema(safes, {
  threshold: z.coerce.number(),
  address: Address,
  createdAt: () => z.coerce.date().default(new Date()),
})
  .omit({
    userId: true,
    updatedAt: true,
    createdAt: true,
  })
  .extend({
    eoas: z.array(insertEoaSchema),
  });

export const selectSafeSchema = createSelectSchema(safes, {
  threshold: z.coerce.number(),
  address: Address,
  createdAt: () => z.coerce.date().default(new Date()),
}).extend({
  eoas: z.array(selectEoaSchema).optional(),
});

export const safesRelations = relations(safes, ({ one, many }) => ({
  user: one(users, {
    fields: [safes.userId],
    references: [users.id],
  }),
  eoas: many(safeEoas),
}));

export const safeEoas = pgTable("safe_eoas", {
  id: uuid("id").primaryKey().defaultRandom(),
  safeId: uuid("safe_id")
    .references(() => safes.id)
    .notNull(),
  eoaId: uuid("eoa_id")
    .references(() => eoas.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const selectSafeEoa = createSelectSchema(safeEoas, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const insertSafeEoa = createInsertSchema(safeEoas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type selectSafeEoa = z.infer<typeof selectSafeEoa>;
export type insertSafeEoa = z.infer<typeof insertSafeEoa>;

export const safeEoaRelations = relations(safeEoas, ({ one }) => ({
  safe: one(safes, {
    fields: [safeEoas.safeId],
    references: [safes.id],
  }),
  eoa: one(eoas, {
    fields: [safeEoas.eoaId],
    references: [eoas.id],
  }),
}));

export const eoaRelations = relations(eoas, ({ one, many }) => ({
  user: one(users, {
    fields: [eoas.userId],
    references: [users.id],
  }),
  safeEoas: many(safeEoas),
}));
