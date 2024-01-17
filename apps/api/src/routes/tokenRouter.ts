import { publicProcedure, router } from "../lib/trpc";
import { z } from "zod";

import { CovalentClient } from "@covalenthq/client-sdk";
import { ChainType, LiFi } from "@lifi/sdk";
import { Address } from "ghommerce-schema/src/address.schema";
import {
  Chain,
  ChainNameToId,
  Chains,
  ChainSchema,
} from "ghommerce-schema/src/chains.schema";
import { QuoteCurrency } from "ghommerce-schema/src/swap.schema";
import { GetTokensOutput } from "ghommerce-schema/src/api/tokens.api.schema";
import {
  TokenAmountSchema,
  TokenSchema,
} from "ghommerce-schema/src/tokens.schema";
import { filterArray } from "ghommerce-schema/src/schema.utils";
import { cachified } from "@epic-web/cachified";
import { lruCache } from "../lib/cache";

export const GetTokensForAddressParams = z.object({
  address: Address,
  quoteCurrency: QuoteCurrency,
  chains: Chain.array().optional(),
});
export type GetTokensForAddressParams = z.infer<
  typeof GetTokensForAddressParams
>;

async function getTokensForAddress(input: GetTokensForAddressParams) {
  return cachified({
    key: `getTokensForAddress-${input.address}-${
      input.quoteCurrency
    }-${input.chains?.map((chain) => chain).join("-")}`,
    cache: lruCache,
    async getFreshValue() {
      const client = new CovalentClient("cqt_rQg66wvckMDgfbm3C3X8XFJGPRTP"); // Replace with your Covalent API key.

      const combined = [];
      for (const chain of input.chains ?? Chains) {
        const tokens =
          await client.BalanceService.getTokenBalancesForWalletAddress(
            chain,
            input.address,
          );
        if (tokens.error) {
          console.error(tokens.error_message);
          continue;
        }
        if (!tokens.data.items) continue;

        console.log("found-tokens", tokens.data.items.length);

        const grouped = tokens.data.items.map((item) => {
          return {
            address: Address.parse(item.contract_address),
            amount: item.balance?.toString() ?? "0",
            name: item.contract_name,
            updated_at: new Date(),
            logoURI: item.logo_url,
            chainId: ChainNameToId[chain],
            priceUSD: item.quote_rate?.toString() ?? "0",
            decimals: item.contract_decimals,
            symbol: item.contract_ticker_symbol,
            chain: {
              id: ChainNameToId[chain],
              name: chain,
              logoURI: item.logo_url,
              displayName: chain,
              isTestnet: false,
            },
          } satisfies TokenAmountSchema;
        });
        combined.push(...grouped);
      }
      return GetTokensOutput.parse({
        address: input.address,
        quote_currency: input.quoteCurrency,
        updated_at: new Date(),
        items: combined.filter((item) => {
          // filter out all tokens with 0 balance and null quote
          return item.priceUSD && item.amount !== "0";
        }),
      });
    },
    /* 5 minutes until cache gets invalid
     * Optional, defaults to Infinity */
    ttl: 300_000,
  });
}

export const tokenRouter = router({
  getTokensForAddress: publicProcedure
    .input(GetTokensForAddressParams.partial())
    .output(GetTokensOutput)
    .query(async ({ input, ctx }) => {
      return await getTokensForAddress(GetTokensForAddressParams.parse(input));
    }),

  getTokenInfo: publicProcedure
    .input(
      z.object({
        tokenAddress: Address,
        quoteCurrency: QuoteCurrency,
        chain: Chain,
      }),
    )
    .query(async ({ input, ctx }) => {
      const client = new CovalentClient("cqt_rQg66wvckMDgfbm3C3X8XFJGPRTP"); // Replace with your Covalent API key.

      const combined = [];
      const prices = await client.PricingService.getTokenPrices(
        input.chain,
        input.quoteCurrency,
        input.tokenAddress,
      );

      console.log("parsed", prices);
      return prices.data;
    }),

  getUserChains: publicProcedure
    .input(
      z.object({
        address: Address.optional(),
      }),
    )
    .output(filterArray(ChainSchema))
    .query(async ({ input, ctx }) => {
      if (!input?.address) throw new Error("Invalid address");
      const covClient = new CovalentClient("cqt_rQg66wvckMDgfbm3C3X8XFJGPRTP"); // Replace with your Covalent API key.
      const chains = await covClient.BaseService.getAddressActivity(
        input.address,
        {
          testnets: true,
        },
      );
      return chains.data.items.map((item) => {
        return {
          name: item.name,
          id: Number(item.chain_id),
          logoURI: item.logo_url,
          displayName: item.label,
          isTestnet: item.is_testnet,
        };
      });
    }),

  getExchangeRate: publicProcedure
    .input(
      z.object({
        quoteCurrency: QuoteCurrency,
      }),
    )
    .query(async ({ input, ctx }) => {
      const client = new CovalentClient("cqt_rQg66wvckMDgfbm3C3X8XFJGPRTP"); // Replace with your Covalent API key.
    }),

  getTokens: publicProcedure
    .input(
      z.object({
        chain: Chain,
      }),
    )
    .output(TokenSchema.array())
    .query(async ({ input, ctx }) => {
      const lifi = new LiFi({
        integrator: "Your dApp/company name",
      });
      const tokens = await lifi.getTokens({
        chains: [ChainNameToId[input.chain]],
        chainTypes: [ChainType.EVM],
      });

      const covalent = new CovalentClient("cqt_rQg66wvckMDgfbm3C3X8XFJGPRTP");

      const chains = await covalent.BaseService.getAllChains();

      const chain = chains.data.items.find(
        (item) => item.chain_id === ChainNameToId[input.chain].toString(),
      );
      if (!chain) throw new Error(`Invalid chain ${input.chain}`);

      return filterArray(TokenSchema).parse(
        tokens.tokens[ChainNameToId[input.chain]].map(
          (item) =>
            ({
              address: Address.parse(item.address),
              name: item.name,
              symbol: item.symbol,
              decimals: item.decimals,
              logoURI: item.logoURI,
              chainId: item.chainId,
              chain: {
                id: item.chainId,
                name: chain.name,
                logoURI: chain.logo_url,
                displayName: chain.label,
                isTestnet: false,
              },
            }) as TokenSchema,
        ),
      );
    }),

  getChains: publicProcedure.output(ChainSchema.array()).query(async () => {
    const covalent = new CovalentClient("cqt_rQg66wvckMDgfbm3C3X8XFJGPRTP");
    const chains = await covalent.BaseService.getAllChains();
    return filterArray(ChainSchema).parse(
      chains.data.items.map(
        (item) =>
          ({
            name: item.name,
            id: Number(item.chain_id),
            logoURI: item.logo_url,
            displayName: item.label,
            isTestnet: item.is_testnet,
          }) as ChainSchema,
      ),
    );
  }),
});
