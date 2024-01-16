import { z } from "zod";
import { Address } from "./address.schema.ts";
import { ChainId, ChainNameToId, ChainSchema } from "./chains.schema.ts";

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

export const BaseTokenSchema = z.object({
  chainId: ChainId,
  address: Address,
});
export type BaseTokenSchema = z.infer<typeof BaseTokenSchema>;
export const StaticTokenSchema = BaseTokenSchema.extend({
  symbol: z.string(),
  decimals: z.number(),
  name: z.string(),
  logoURI: z.string().optional(),
  chain: ChainSchema,
});
export const TokenSchema = StaticTokenSchema.extend({
  priceUSD: z.string().optional(),
});
export const TokenAmountSchema = TokenSchema.extend({
  amount: z.string(),
  updated_at: z.coerce.date(),
});

export type TokenSchema = z.infer<typeof TokenSchema>;
export type TokenAmountSchema = z.infer<typeof TokenAmountSchema>;
