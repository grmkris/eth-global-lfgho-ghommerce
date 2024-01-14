import { OrderBookApi, OrderQuoteSideKindSell } from "@cowprotocol/cow-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { OrderSigningUtils, SupportedChainId } from "@cowprotocol/cow-sdk";
import { useEthersSigner } from "@/lib/useEthersSigner.tsx";
import { SwapSchema } from "schema/src/swap.schema.ts";
import { ChainNameToId } from "schema/src/chains.schema.ts";

const COWSWAP_ENABLED_CHAINS = [
  ChainNameToId["eth-mainnet"],
  ChainNameToId["gnosis-mainnet"],
  ChainNameToId["eth-goerli"],
  ChainNameToId["eth-sepolia"],
] as number[];

export const useCowSwapQuote = (props: {
  swap: SwapSchema;
}) => {
  const account = useAccount();

  return useQuery({
    queryKey: ["cow", "swap", "marketPrice", props, account.address],
    enabled: !!account.address,
    queryFn: async () => {
      if (!account.address) throw new Error("Invalid fromToken.address");
      if (props.swap.fromToken.chain !== props.swap.toToken.chain)
        throw new Error("Cross-chain swaps not supported with CowSwap");
      if (!COWSWAP_ENABLED_CHAINS.includes(props.swap.fromToken.chain.id))
        throw new Error("Chain not supported with CowSwap");
      const orderBookApi = new OrderBookApi({
        chainId: props.swap.fromToken.chain.id,
      });
      return await orderBookApi.getQuote({
        kind: OrderQuoteSideKindSell.SELL,
        sellToken: props.swap.fromToken.address, // WETH
        buyToken: props.swap.toToken.address, // DAI
        sellAmountAfterFee: props.swap.fromAmount.toString(),
        receiver: props.swap.toAddress,
        from: account.address,
      });
    },
  });
};

export const useCowSwapCreateOrder = (props: {
  swap: SwapSchema;
}) => {
  const signer = useEthersSigner();
  const marketPrice = useCowSwapQuote(props);
  return useMutation({
    mutationFn: async () => {
      if (!marketPrice.data?.quote) throw new Error("No market quote");
      if (!signer) throw new Error("No signer");
      if (props.swap.fromToken.chain !== props.swap.toToken.chain)
        throw new Error("Cross-chain swaps not supported with CowSwap");
      if (!COWSWAP_ENABLED_CHAINS.includes(props.swap.fromToken.chain.id))
        throw new Error("Chain not supported with CowSwap");

      const orderBookApi = new OrderBookApi({
        chainId: props.swap.fromToken.chain.id,
      });
      const quote = {
        ...marketPrice.data.quote,
        receiver: props.swap.toAddress,
      };
      const signedOrder = await OrderSigningUtils.signOrder(
        quote,
        SupportedChainId.MAINNET,
        signer,
      );

      const orderId = await orderBookApi.sendOrder({
        ...quote,
        ...signedOrder,
        signingScheme: signedOrder.signingScheme,
      });

      console.log("orderId", orderId);
      console.log("order url", orderBookApi.getOrderLink(orderId)); // https://explorer.cow.fi/goerli/orders/${orderId}
      return orderId;
    },
  });
};
