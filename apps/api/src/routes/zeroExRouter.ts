import { z } from "zod";
import { authProcedure, router } from "../lib/trpc";
import { SwapSchema } from "ghommerce-schema/src/swap.schema";
import { Address } from "ghommerce-schema/src/address.schema";

/**
 * Ethereum (Mainnet): https://api.0x.org/
 * Ethereum (Sepolia): https://sepolia.api.0x.org/
 * Arbitrum: https://arbitrum.api.0x.org/
 * Avalanche: https://avalanche.api.0x.org/
 * Base: https://base.api.0x.org/
 * Binance Smart Chain: https://bsc.api.0x.org/
 * Celo: https://celo.api.0x.org/
 * Fantom: https://fantom.api.0x.org/
 * Optimism: https://optimism.api.0x.org/
 * Polygon: https://polygon.api.0x.org/
 * Polygon (Mumbai): https://mumbai.api.0x.org
 */
const headers = { "0x-api-key": "db3a2342-401c-4fbe-a2e3-d74e850a3bda" }; // This is a placeholder. Get your live API key from the 0x Dashboard (https://dashboard.0x.org/apps)
export const ZeroExRouterConfig = {
  "eth-mainnet": "https://api.0x.org/",
  "eth-sepolia": "https://sepolia.api.0x.org/",
  "arbitrum-mainnet": "https://arbitrum.api.0x.org/",
  "avalanche-mainnet": "https://avalanche.api.0x.org/",
  base: "https://base.api.0x.org/",
  "bsc-mainnet": "https://bsc.api.0x.org/",
  celo: "https://celo.api.0x.org/",
  fantom: "https://fantom.api.0x.org/",
  "optimism-mainnet": "https://optimism.api.0x.org/",
  "matic-mainnet": "https://polygon.api.0x.org/",
  "polygon-mumbai": "https://mumbai.api.0x.org",
};

export const ZERO_EX_ROUTER_CHAINS = [
  "eth-mainnet",
  "eth-sepolia",
  "arbitrum-mainnet",
  "avalanche-mainnet",
  "base",
  "celo",
  "fantom",
  "optimism-mainnet",
  "matic-mainnet",
  "polygon-mumbai",
] as const;

export const ZeroExRouterChain = z.enum(ZERO_EX_ROUTER_CHAINS);
export type ZeroExRouterChain = z.infer<typeof ZeroExRouterChain>;

export const ZeroExSwapSchema = z.object({
  sellToken: Address,
  buyToken: Address,
  sellAmount: z.string(),
  takerAddress: Address,
  chain: ZeroExRouterChain,
});
export type ZeroExSwapSchema = z.infer<typeof ZeroExSwapSchema>;

export const ZeroExPriceResponseSchema = z.object({
  price: z.string(),
  gasPrice: z.string(),
  gas: z.string(),
  sellAmount: z.string(),
  buyAmount: z.string(),
  buyTokenAddress: z.string(),
  sellTokenAddress: z.string(),
  allowanceTarget: z.string(),
});

export const ZeroExQuoteResponseSchema = z.object({
  sellAmount: z.string(),
  buyAmount: z.string(),
  price: z.string(),
  guaranteedPrice: z.string(),
  to: z.string(),
  data: z.string(),
  value: z.string(),
  gas: z.string(),
  gasPrice: z.string(),
  buyTokenAddress: z.string(),
  sellTokenAddress: z.string(),
  allowanceTarget: z.string(),
});
export type ZeroExQuoteResponseSchema = z.infer<
  typeof ZeroExQuoteResponseSchema
>;

export const ZeroExRouter = router({
  getPrice: authProcedure
    .input(SwapSchema)
    .output(ZeroExPriceResponseSchema)
    .query(async ({ ctx, input }) => {
      if (!input.fromToken.chain) throw new Error("Chain is required");
      if (!input.toToken.chain) throw new Error("Sell token is required");
      if (!input.fromToken) throw new Error("Buy token is required");
      if (!input.fromAmount) throw new Error("Sell amount is required");
      if (!input.fromAddress) throw new Error("Taker address is required");
      const chain = ZeroExRouterChain.safeParse(input.fromToken.chain.name);
      if (!chain.success)
        throw new Error(`Invalid chain ${input.fromToken.chain}`);
      const url = ZeroExRouterConfig[chain.data];
      if (input.fromToken.chain.name !== input.toToken.chain.name)
        throw new Error(
          `Cross-chain swaps are not supported:  FromToken: ${input.fromToken.chain.name} != ToToken: ${input.toToken.chain.name}`,
        );

      if (input.fromToken.address === input.toToken.address)
        throw new Error("Same token");
      const swapSchema = ZeroExSwapSchema.parse({
        sellToken: input.fromToken.address,
        buyToken: input.toToken.address,
        sellAmount: input.fromAmount.toString(),
        takerAddress: input.fromAddress,
        chain: chain.data,
      } satisfies ZeroExSwapSchema);

      // Fetch the swap price.
      const response = await fetch(
        `${url}/swap/v1/price?${new URLSearchParams(swapSchema)}`,
        { headers },
      );

      const json = await response.json();
      console.log("responsezero-ex", json, swapSchema);
      return ZeroExPriceResponseSchema.parse(json);
    }),

  getQuote: authProcedure
    .input(SwapSchema)
    .output(ZeroExQuoteResponseSchema)
    .query(({ ctx, input }) => {
      const chain = ZeroExRouterChain.safeParse(input.fromToken.chain);
      if (!chain.success) throw new Error("Invalid chain");
      const url = ZeroExRouterConfig[chain.data];
      if (input.fromToken.chain !== input.toToken.chain)
        throw new Error("Cross-chain swaps are not supported");

      if (!url) {
        throw new Error(`Chain ${chain} not supported by 0x API`);
      }

      const swapSchema = ZeroExSwapSchema.parse({
        sellToken: input.fromToken.address,
        buyToken: input.toToken.address,
        sellAmount: input.fromAmount.toString(),
        takerAddress: input.fromAddress,
        chain: chain.data,
      } satisfies ZeroExSwapSchema);

      // Fetch the swap price.
      return fetch(`${url}/swap/v1/quote?${new URLSearchParams(swapSchema)}`, {
        headers,
      }).then((response) => response.json());
    }),
});
