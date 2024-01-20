import { z } from "zod";

export const INVOICE_STATUSES = ["pending", "paid", "handled"] as const;
export const InvoiceStatus = z.enum(INVOICE_STATUSES);
export type InvoiceStatus = z.infer<typeof InvoiceStatus>;
