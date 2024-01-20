import { z } from "zod";
import { selectInvoiceSchema } from "../db/invoices.db.ts";
import { TokenSchema } from "../tokens.schema.ts";
import { selectStoreSchema } from "../db/stores.db.ts";
import { Address } from "../address.schema.ts";

export const InvoiceSchema = selectInvoiceSchema
  .pick({
    id: true,
    description: true,
    currency: true,
    status: true,
    dueDate: true,
    amountDue: true,
  })
  .extend({
    isTestnet: z.boolean().optional(),
    acceptedTokens: TokenSchema.array(),
    payer: selectInvoiceSchema.pick({
      payerEmail: true,
      payerWallet: true,
      payerName: true,
    }),
    store: selectStoreSchema
      .pick({
        name: true,
        description: true,
      })
      .extend({
        wallet: Address,
      }),
  });

export type InvoiceSchema = z.infer<typeof InvoiceSchema>;
