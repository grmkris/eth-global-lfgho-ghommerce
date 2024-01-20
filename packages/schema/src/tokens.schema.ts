import { z } from "zod";
import { Address } from "./address.schema.ts";
import { ChainId, ChainSchema } from "./chains.schema.ts";

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

export const AVAILABLE_TOKENS = ["USDC", "USDT", "GHO", "DAI", "ETH"] as const;
export const AvailableToken = z.enum(AVAILABLE_TOKENS);
export type AvailableToken = z.infer<typeof AvailableToken>;

export const BaseTokenSchema = z.object({
  chainId: ChainId,
  address: Address,
});
export type BaseTokenSchema = z.infer<typeof BaseTokenSchema>;
export const StaticTokenSchema = BaseTokenSchema.extend({
  symbol: z.string().optional(),
  decimals: z.number(),
  name: z.string(),
  logoURI: z.string().optional(),
  chain: ChainSchema,
});
export const TokenSchema = StaticTokenSchema.extend({
  priceUSD: z.string(),
});
export const TokenAmountSchema = TokenSchema.extend({
  amount: z.string(),
  updated_at: z.coerce.date(),
});

export type TokenSchema = z.infer<typeof TokenSchema>;
export type TokenAmountSchema = z.infer<typeof TokenAmountSchema>;

export const ERC20_TOKEN_MAPPER: Record<
  "testnet" | "mainnet",
  Record<AvailableToken, BaseTokenSchema[]>
> = {
  testnet: {
    USDC: [
      {
        chainId: 5,
        address: "0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF",
      },
      {
        chainId: 80001,
        address: "0xdA5289fCAAF71d52a80A254da614a192b693e977",
      },
    ],
    USDT: [
      {
        chainId: 5,
        address: "0x64ef393b6846114bad71e2cb2ccc3e10736b5716",
      },
      {
        chainId: 80001,
        address: "0xeaBc4b91d9375796AA4F69cC764A4aB509080A58",
      },
    ],
    GHO: [
      {
        chainId: 5,
        address: "0xcbE9771eD31e761b744D3cB9eF78A1f32DD99211",
      },
    ],
    DAI: [
      {
        chainId: 5,
        address: "0x2686eca13186766760a0347ee8eeb5a88710e11b",
      },
      {
        chainId: 80001,
        address: "0xF14f9596430931E177469715c591513308244e8F",
      },
    ],
    ETH: [
      {
        chainId: 5,
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      },
      {
        chainId: 80001,
        address: "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa", // https://docs.li.fi/integrate-li.fi-js-sdk/testing-your-integration/supported-testnets-and-tokens
      },
    ],
  },
  mainnet: {
    USDC: [
      {
        chainId: 1,
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
    ],
    USDT: [
      {
        chainId: 1,
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      },
    ],
    GHO: [
      {
        chainId: 1,
        address: "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f",
      },
    ],
    DAI: [
      {
        chainId: 1,
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      },
    ],
    ETH: [
      {
        chainId: 1,
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      },
    ],
  },
} as const;
