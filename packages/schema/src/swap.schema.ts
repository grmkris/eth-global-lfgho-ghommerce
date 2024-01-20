import { z } from "zod";
import { Address } from "./address.schema.ts";
import { TokenSchema } from "./tokens.schema.ts";

export const SwapSchema = z.object({
  fromToken: TokenSchema,
  toToken: TokenSchema,
  fromAmount: z.string().describe("Amount of fromToken to swap in wei ( 1 USDT = 1 000 000"),
  toAddress: Address,
  fromAddress: Address,
});
export type SwapSchema = z.infer<typeof SwapSchema>;

export const QuoteCurrencies = [
  "USD",
  "CAD",
  "EUR",
  "SGD",
  "INR",
  "JPY",
  "VND",
  "CNY",
  "KRW",
  "RUB",
  "TRY",
  "NGN",
  "ARS",
  "AUD",
  "CHF",
  "GBP",
] as const;
export const QuoteCurrency = z.enum(QuoteCurrencies);
export type QuoteCurrency = z.infer<typeof QuoteCurrency>;
