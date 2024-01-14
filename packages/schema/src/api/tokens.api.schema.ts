import { z } from "zod";
import { Address } from "../address.schema.ts";
import { QuoteCurrency } from "../swap.schema.ts";
import { TokenAmountSchema, TokenSchema } from "../tokens.schema.ts";

export const GetTokensOutput = z.object({
  address: Address,
  quote_currency: QuoteCurrency,
  updated_at: z.coerce.date(),
  items: TokenAmountSchema.array(),
});

export type GetTokensOutput = z.infer<typeof GetTokensOutput>;
