ALTER TABLE "payments" ALTER COLUMN "token" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "to_token" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN IF EXISTS "amount_paid";