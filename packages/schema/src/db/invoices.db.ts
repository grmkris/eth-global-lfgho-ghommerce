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

import { payments } from "./payments.db.ts";
import { selectStoreSchema, stores } from "./stores.db.ts";
import { BaseTokenSchema } from "../tokens.schema.ts";
import { QuoteCurrencies, QuoteCurrency } from "../swap.schema.ts";
import { Address } from "../address.schema.ts";
import { INVOICE_STATUSES, InvoiceStatus } from "../invoice.schema.ts";

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  payerEmail: text("payer_email"),
  payerName: text("payer_name"),
  payerWallet: text("payer_wallet").$type<Address>(),
  description: text("description").notNull(),
  amountDue: bigint("amount_due", { mode: "number" }).notNull(),
  currency: text("currency", { enum: QuoteCurrencies }).notNull(),
  acceptedTokens: jsonb("accepted_tokens").notNull().$type<BaseTokenSchema[]>(),
  dueDate: timestamp("due_date", { mode: "date" }),
  status: text("status", { enum: INVOICE_STATUSES })
    .notNull()
    .$type<InvoiceStatus>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const selectInvoiceSchema = createSelectSchema(invoices, {
  id: (schema) => schema.id.uuid(),
  currency: QuoteCurrency,
  acceptedTokens: z.array(BaseTokenSchema),
  payerEmail: z.string().optional(),
  payerWallet: Address.optional(),
  payerName: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  createdAt: () => z.coerce.date(),
  updatedAt: () => z.coerce.date(),
}).extend({
  store: selectStoreSchema.optional(),
});

export const insertInvoiceSchema = createInsertSchema(invoices, {
  currency: QuoteCurrency,
  payerEmail: z.string().email().optional(),
  payerWallet: Address.optional(),
  acceptedTokens: z.array(BaseTokenSchema),
  payerName: z.string().optional(),
  amountDue: z.coerce.number(),
  dueDate: z.coerce.date().optional(),
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

export const PayerInformationSchema = selectInvoiceSchema.pick({
  payerEmail: true,
  payerName: true,
  payerWallet: true,
});
export type PayerInformationSchema = z.infer<typeof PayerInformationSchema>;
