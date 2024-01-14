import { constructSimpleSDK, SwapSide } from "@paraswap/sdk";
import { useEthersSigner } from "@/lib/useEthersSigner.tsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { OptimalRate } from "@paraswap/sdk/src/types.ts";
import { BigNumber } from "ethers";
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";
import { ZERO_ADDRESS } from "ghommerce-schema/src/tokens.schema";

export const useParaSwapRoute = (props: {
  swap: SwapSchema;
}) => {
  const signer = useEthersSigner();

  return useQuery({
    queryKey: ["paraswap", "routes", props],
    queryFn: async () => {
      if (!props.swap.fromToken.address)
        throw new Error("Invalid fromToken.address");
      if (!props.swap.toToken.address)
        throw new Error("Invalid toToken.address");
      if (!props.swap.toToken.chain?.id)
        throw new Error("Invalid toToken.chain.id");
      if (props.swap.fromToken.chain?.id !== props.swap.toToken.chain?.id)
        throw new Error("Paraswap only supports same chain swaps");
      if (props.swap.fromToken.address === props.swap.toToken.address)
        throw new Error("Same token");

      const paraSwapMin = constructSimpleSDK({
        chainId: props.swap.toToken.chain?.id,
        fetch,
      });
      const senderAddress = signer?._address;
      try {
        return await paraSwapMin.swap.getRate({
          // for some reason paraswap has zero address as 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
          srcToken:
            props.swap.fromToken.address === ZERO_ADDRESS
              ? "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
              : props.swap.fromToken.address,
          destToken:
            props.swap.toToken.address === ZERO_ADDRESS
              ? "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
              : props.swap.toToken.address,
          amount: props.swap.fromAmount.toString(),
          userAddress: senderAddress,
          side: SwapSide.SELL,
        });
      } catch (e) {
        console.error({
          e,
          props,
        });
        throw e;
      }
    },
  });
};

export const useExecuteParaSwap = (props: {
  swap: SwapSchema;
}) => {
  const signer = useEthersSigner();
  return useMutation({
    mutationFn: async (variables: {
      route: OptimalRate;
    }) => {
      if (!signer) throw new Error("No signer");
      if (!props.swap.fromToken.address)
        throw new Error("Invalid fromToken.address");
      if (!props.swap.toToken.address)
        throw new Error("Invalid toToken.address");
      if (!props.swap.fromAmount) throw new Error("Invalid fromAmount");
      if (!props.swap.toAddress) throw new Error("Invalid toAddress");

      const paraSwapMin = constructSimpleSDK({ chainId: 1, fetch });
      const senderAddress = signer?._address;
      const txParams = await paraSwapMin.swap.buildTx({
        srcToken: props.swap.fromToken.address,
        destToken: props.swap.toToken.address,
        srcAmount: variables.route.srcAmount,
        destAmount: variables.route.destAmount,
        priceRoute: variables.route,
        userAddress: senderAddress,
      });
      const transaction = {
        ...txParams,
        gasPrice: `0x${new BigNumber(txParams.gasPrice, "16").toString()}`,
        gasLimit: `0x${new BigNumber(5000000, "16").toString()}`,
        value: `0x${new BigNumber(txParams.value, "16").toString()}`,
      };

      const txr = await signer.sendTransaction(transaction);
      return txr;
    },
  });
};
