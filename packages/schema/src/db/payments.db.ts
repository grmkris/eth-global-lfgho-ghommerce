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
  amountPaid: bigint("amount_paid", { mode: "number" }).notNull(), // in currency units based on invoice defined currency (USD, EUR, etc.)
  token: jsonb("token").notNull(), // e.g., { token: 'ETH', amount: '0.1' }
  paymentDate: timestamp("payment_date", { mode: "date" }),
  paymentMethod: text("payment_method").notNull(), // e.g., 'wallet', 'credit_card'
  transactionHash: text("transaction_id"), // For blockchain or other payment gateway transaction references
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments, {
  id: (schema) => schema.id.uuid(),
  token: TokenAmountSchema,
}).omit({
  updatedAt: true,
  createdAt: true,
});

export const selectPaymentSchema = createSelectSchema(payments, {
  token: TokenAmountSchema,
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
