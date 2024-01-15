import { relations } from "drizzle-orm";
import {
  bigint,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { payments } from "./payments";
import { selectStoreSchema, stores } from "./stores.ts";
import { BaseTokenSchema } from "../tokens.schema.ts";
import { QuoteCurrencies, QuoteCurrency } from "../swap.schema.ts";
import { Address } from "../address.schema.ts";

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  payerEmail: text("payer_email"),
  payerName: text("payer_name"),
  payerWallet: text("payer_wallet"),
  description: text("description").notNull(),
  amountDue: bigint("amount_due", { mode: "number" }).notNull(),
  currency: text("currency", { enum: QuoteCurrencies }).notNull(),
  acceptedTokens: jsonb("accepted_tokens").notNull(),
  dueDate: timestamp("due_date", { mode: "date" }),
  status: text("status", { enum: ["pending", "paid", "handled"] }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const selectInvoiceSchema = createSelectSchema(invoices, {
  id: (schema) => schema.id.uuid(),
  currency: z.enum(QuoteCurrencies),
  acceptedTokens: z.array(BaseTokenSchema),
  payerEmail: z.string().optional(),
  payerWallet: Address.optional(),
  payerName: z.string().optional(),
  dueDate: z.coerce.date(),
  createdAt: () => z.coerce.date().default(new Date()),
  updatedAt: () => z.coerce.date().default(new Date()),
}).extend({
  store: selectStoreSchema.optional(),
});

export const insertInvoiceSchema = createInsertSchema(invoices, {
  currency: QuoteCurrency,
  payerEmail: z.string().optional(),
  payerWallet: z.string().optional(),
  // acceptedTokens: z.array(BaseTokenSchema),
  acceptedTokens: BaseTokenSchema,
  payerName: z.string().optional(),
  amountDue: z.coerce.number(),
  dueDate: z.coerce.date(),
  createdAt: () => z.coerce.date().default(new Date()),
}).omit({ userId: true, updatedAt: true, createdAt: true });

export const invoicesRelations = relations(invoices, ({ many, one }) => ({
  payments: many(payments),
  store: one(stores, {
    fields: [invoices.storeId],
    references: [stores.id],
  }),
}));

export type insertInvoiceSchema = z.infer<typeof insertInvoiceSchema>;
export type selectInvoiceSchema = z.infer<typeof selectInvoiceSchema>;
