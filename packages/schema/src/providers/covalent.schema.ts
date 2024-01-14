import { z } from "zod";
import { Address } from "../address.schema.ts";
import { Chain } from "../chains.schema.ts";
import { QuoteCurrency } from "../swap.schema.ts";

export const TokenItem = z.object({
  chain_name: Chain,
  contract_decimals: z.number().nullish(),
  contract_name: z.string().nullish(),
  contract_ticker_symbol: z.string().nullish(),
  contract_address: Address.nullish(),
  contract_display_name: z.string().nullish(),
  supports_erc: z.array(z.string()).nullish(),
  logo_url: z.string().url().nullish().nullish(),
  logo_urls: z
    .object({
      token_logo_url: z.string().url().nullish(),
      protocol_logo_url: z.string().url().nullish(),
      chain_logo_url: z.string().url().nullish(),
    })
    .nullish(),
  last_transferred_at: z.coerce.date().nullish(),
  native_token: z.boolean(),
  // One of cryptocurrency, stablecoin, nft or dust.
  type: z.string(),
  is_spam: z.boolean(),
  balance: z.coerce.number().nullish(),
  balance_24h: z.coerce.number().nullish(),
  quote_rate: z.number().nullish(),
  quote_rate_24h: z.number().nullish(),
  quote: z.number().nullish(),
  quote_24h: z.number().nullish(),
  pretty_quote: z.string().nullish(),
  pretty_quote_24h: z.string().nullish(),
});
export type TokenItem = z.infer<typeof TokenItem>;
