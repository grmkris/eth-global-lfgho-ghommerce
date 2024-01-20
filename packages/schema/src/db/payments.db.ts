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

import { invoices } from "./invoices.db.ts";
import { TokenAmountSchema } from "../tokens.schema.ts";
import { donations } from "./donations.db.ts";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .references(() => invoices.id)
    .notNull(),
  fromToken: jsonb("token").$type<TokenAmountSchema>(),
  toToken: jsonb("to_token").notNull().$type<TokenAmountSchema>(),
  paymentDate: timestamp("payment_date", { mode: "date" }),
  paymentMethod: text("payment_method").notNull(), // e.g., 'wallet', 'credit_card'
  transactionHash: text("transaction_id"), // For blockchain or other payment gateway transaction references
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments, {
  id: (schema) => schema.id.uuid(),
  fromToken: TokenAmountSchema,
  toToken: TokenAmountSchema,
}).omit({
  updatedAt: true,
  createdAt: true,
});

export const selectPaymentSchema = createSelectSchema(payments, {
  fromToken: TokenAmountSchema,
  toToken: TokenAmountSchema,
  createdAt: z.coerce.date().default(new Date()),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  donation: one(donations, {
    fields: [payments.invoiceId],
    references: [donations.id],
  }),
}));

export type insertPaymentSchema = z.infer<typeof insertPaymentSchema>;
export type selectPaymentSchema = z.infer<typeof selectPaymentSchema>;
