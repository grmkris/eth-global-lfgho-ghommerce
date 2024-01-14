import { Route } from "@tanstack/react-router";
import { rootRoute } from "@/routes/Router.tsx";
import { TokenDropdown } from "@/components/web3/TokenDropdown.tsx";
import { ChainDropdown } from "@/components/web3/ChainDropdown.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useAccount } from "wagmi";
import { apiTrpc } from "@/trpc-client.ts";

import { useState } from "react";
import { useSwapStore } from "@/routes/swap/useSwapStore.tsx";
import { TokenList } from "@/components/web3/TokenList.tsx";
import { OneInchScreen } from "@/lib/1inch/OneInchScreen.tsx";
import { LifiScreen } from "@/lib/lifi/LifiScreen.tsx";
import { ZeroExScreen } from "@/lib/0x/ZeroExScreen.tsx";
import { ParaSwapScreen } from "@/lib/paraswap/ParaswapScreen.tsx";
import { ChainSchema } from "schema/src/chains.schema.ts";
import { SwapSchema } from "schema/src/swap.schema.ts";
import {
  TokenAmountSchema,
  TokenSchema,
  ZERO_ADDRESS,
} from "schema/src/tokens.schema.ts";
import { Skeleton } from "@/components/ui/skeleton";

const SwapPage = () => {
  const account = useAccount();
  const { setToChain, swap, setToAmount, setToToken, init } = useSwapStore(
    (state) => ({
      setToChain: state.setToChain,
      setToToken: state.setToToken,
      setToAmount: state.setToAmount,
      swap: state.swap,
      init: state.init,
    }),
  );
  const swapData = SwapSchema.safeParse(swap);
  const chains = apiTrpc.tokens.getChains.useQuery();
  const tokens = apiTrpc.tokens.getTokens.useQuery({
    chain: swap?.toToken?.chain?.name ?? "eth-mainnet",
  });
  return (
    <div className={"flex flex-col space-y-1"}>
      <h1>Swap</h1>
      <ChainDropdown
        onChange={(chain) => {
          setToChain(chain[0]);
          if (!account.address) return;
          init({
            toAddress: account.address,
            fromAddress: account.address,
          });
        }}
        value={swap?.toToken?.chain ? [swap.toToken.chain] : undefined}
        options={chains.data ?? []}
      />
      <TokenDropdown
        chain={swap?.toToken?.chain}
        onChange={(token) => {
          setToToken(token[0]);
        }}
        options={tokens.data ?? []}
        value={
          TokenSchema.safeParse(swap.toToken).success
            ? [TokenSchema.parse(swap.toToken)]
            : undefined
        }
      />
      <Input
        placeholder="Amount"
        onChange={(e) => setToAmount(BigInt(e.target.value))}
      />
      {swapData.success && (
        <div>
          <OneInchScreen swap={swapData.data} />
          <LifiScreen swap={swapData.data} />
          <ZeroExScreen order={swapData.data} />
          <ParaSwapScreen swap={swapData.data} />
        </div>
      )}
      <WalletBalance />
    </div>
  );
};

export const swapRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/swap",
  component: SwapPage,
});

export const WalletBalance = () => {
  const { setFromChain, setFromToken, swap } = useSwapStore((state) => ({
    setFromChain: state.setFromChain,
    setFromToken: state.setFromToken,
    swap: state.swap,
  }));
  const tokenPrice = apiTrpc.tokens.getTokenInfo.useQuery(
    {
      quoteCurrency: "USD",
      tokenAddress: swap?.toToken?.address ?? ZERO_ADDRESS,
      chain: swap?.toToken?.chain?.name ?? "eth-mainnet",
    },
    {
      enabled: !!swap?.toToken?.address,
    },
  );
  const account = useAccount();
  const chains = apiTrpc.tokens.getChains.useQuery();
  const userChains = apiTrpc.tokens.getUserChains.useQuery(
    {
      address: account.address,
    },
    {
      enabled: !!account.address,
    },
  );
  const [selectedWalletChains, setSelectedWalletChains] = useState<
    ChainSchema[] | undefined
  >();
  const tokens = apiTrpc.tokens.getTokensForAddress.useQuery(
    {
      quoteCurrency: "USD",
      address: account.address,
      chains: selectedWalletChains?.map((x) => x.name),
    },
    {
      enabled: !!account.address,
    },
  );

  return (
    <div className={"flex flex-col space-y-1"}>
      <w3m-button />
      <h3 className="text-lg font-bold">Wallet Tokens</h3>
      {userChains.data ? (
        <ChainDropdown
          onChange={(chain) => {
            setSelectedWalletChains(chain);
          }}
          value={selectedWalletChains ?? userChains.data ?? []}
          options={chains.data ?? []}
          multiple={true}
        />
      ) : (
        <Skeleton className={"h-10"} />
      )}
      {tokens.data ? (
        <TokenList
          swapData={{
            toToken: {
              ...swap.toToken,
              priceUSD: tokenPrice.data?.[0].prices[0].price.toString(),
            },
            toAddress: swap.toAddress,
            fromAddress: swap.fromAddress,
            toAmount: swap.toAmount,
          }}
          onSelect={(token) => {
            setFromChain(token.chain);
            setFromToken(token);
          }}
          tokens={TokenAmountSchema.array().parse(
            tokens.data.items.filter((x) => x.priceUSD > 0),
          )}
          selectedTokens={swap.fromToken ? [swap.fromToken] : []}
        />
      ) : (
        <Skeleton className={"h-10"} />
      )}
    </div>
  );
};
