import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Address } from "wagmi";
import { SwapSchema } from "schema/src/swap.schema.ts";
import { TokenSchema } from "schema/src/tokens.schema.ts";
import { ChainSchema } from "schema/src/chains.schema.ts";
import { z } from "zod";

export const SwapStoreSchema = SwapSchema.extend({
  fromToken: TokenSchema.partial(),
  toToken: TokenSchema.partial(),
}).partial();
export type SwapStoreSchema = z.infer<typeof SwapStoreSchema>;

export type SwapStore = {
  swap: Partial<SwapStoreSchema>;

  init(props: {
    fromAddress: Address;
    toAddress: Address;
  }): void;
  setFromToken: (token: TokenSchema) => void;
  setToToken: (token: TokenSchema) => void;
  setToAmount: (amount: bigint) => void;
  setFromAmount: (amount: bigint) => void;
  setToChain: (chain: ChainSchema) => void;
  setFromChain: (chain: ChainSchema) => void;
  setToAddress: (address: Address) => void;
};

export const useSwapStore = create<SwapStore>()(
  immer((set) => ({
    swap: {
      fromToken: undefined,
      toToken: undefined,
      fromAmount: undefined,
      toAddress: undefined,
      fromAddress: undefined,
    },
    setFromToken: (token) =>
      set((draft) => {
        draft.swap.fromToken = token;
      }),
    setToToken: (token) =>
      set((draft) => {
        draft.swap.toToken = token;
      }),
    setToAmount: (amount) =>
      set((draft) => {
        draft.swap.toAmount = amount;
      }),
    setFromAmount: (amount) =>
      set((draft) => {
        draft.swap.fromAmount = amount;
      }),
    setToChain: (chain) =>
      set((draft) => {
        if (!draft.swap.toToken) {
          draft.swap.toToken = {
            chain: chain,
          };
          return;
        }
        draft.swap.toToken.chain = chain;
      }),
    setFromChain: (chain) =>
      set((draft) => {
        if (!draft.swap.fromToken) {
          draft.swap.fromToken = {
            chain: chain,
          };
          return;
        }
        draft.swap.fromToken.chain = chain;
      }),
    setToAddress: (address) =>
      set((draft) => {
        draft.swap.toAddress = address;
      }),
    init: (props) =>
      set((draft) => {
        draft.swap.fromAddress = props.fromAddress;
        draft.swap.toAddress = props.toAddress;
      }),
  })),
);
