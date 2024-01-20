import {pgTable, uuid} from "drizzle-orm/pg-core";
import {invoices} from "./invoices.db.ts";
import {donations} from "./donations.db.ts";
import {relations} from "drizzle-orm";

export const invoiceToDonation =  pgTable("invoice_to_donation", {
    invoiceId: uuid("invoice_id")
        .notNull()
        .references(() => invoices.id),
    donationId: uuid("donation_id")
        .notNull()
        .references(() => donations.id),
});

export const invoiceToDonationRelations = relations(invoiceToDonation, ({many, one}) => ({
    invoice: one(invoices, {
        fields: [invoiceToDonation.invoiceId],
        references: [invoices.id],
    }),
    donation: one(donations, {
        fields: [invoiceToDonation.donationId],
        references: [donations.id],
    }),
}));
