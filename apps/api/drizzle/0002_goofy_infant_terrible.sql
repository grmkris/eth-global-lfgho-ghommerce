CREATE TABLE IF NOT EXISTS "invoice_to_donation" (
	"invoice_id" uuid NOT NULL,
	"donation_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_to_donation" ADD CONSTRAINT "invoice_to_donation_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_to_donation" ADD CONSTRAINT "invoice_to_donation_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "donations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
