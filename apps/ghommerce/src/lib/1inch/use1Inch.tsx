import { FusionSDK } from "@1inch/fusion-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  erc20ABI,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { useToast } from "@/components/ui/use-toast.ts";
import {
  chainIdTo1InchNetwork,
  is1InchNetworkSupported,
  ViemWalletClientProvider,
} from "@/lib/1inch/1inch-utils.ts";
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";

export const use1InchOrderQuote = (props: {
  swap: SwapSchema;
}) => {
  return useQuery({
    enabled:
      !!props.swap.fromAmount &&
      !!props.swap.fromToken &&
      !!props.swap.toToken &&
      !!props.swap.fromAddress &&
      !!props.swap.toAddress,
    queryKey: ["1inch", "quote", props],
    queryFn: async () => {
      if (
        !props.swap.fromAmount ||
        !props.swap.fromToken ||
        !props.swap.toToken
      )
        throw new Error("Invalid order");
      if (props.swap.fromToken.chain?.id !== props.swap.toToken.chain?.id)
        throw new Error("Cross chain not supported");
      if (!props.swap.fromToken.chain?.id) throw new Error("Invalid chain");
      if (!props.swap.toToken.address) throw new Error("Invalid address");
      if (!props.swap.fromToken.address) throw new Error("Invalid address");
      if (props.swap.fromToken.address === props.swap.toToken.address)
        throw new Error("Same token");

      const sdk = new FusionSDK({
        url: "https://fusion.1inch.io",
        network: chainIdTo1InchNetwork(props.swap.fromToken.chain.id),
      });

      return await sdk.getQuote({
        amount: props.swap.fromAmount.toString(),
        toTokenAddress: props.swap.toToken.address,
        fromTokenAddress: props.swap.fromToken.address,
      });
    },
  });
};

export const useSwapOneInch = (props: {
  swap: SwapSchema;
}) => {
  const toaster = useToast();
  const wc = useWalletClient();
  const pc = usePublicClient();

  const { config } = usePrepareContractWrite({
    address: props.swap.fromToken.address,
    abi: erc20ABI,
    functionName: "approve",
    args: [
      "0x1111111254eeb25477b68fb85ed929f73a960582",
      BigInt(props.swap.fromAmount),
    ], // TODO move address to param for dynamic chain
    enabled:
      !!wc.data?.account && !!props.swap.fromToken && !!props.swap.fromAmount,
  });
  const increaseAllowance = useContractWrite(config);

  const allowance = useContractRead({
    address: props.swap.fromToken.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [
      wc.data?.account?.address ?? "0x00000000000",
      "0x1111111254eeb25477b68fb85ed929f73a960582", // TODO move address to param for dynamic chain
    ],
    enabled: !!wc.data?.account && !!props.swap.fromToken,
  });

  return useMutation({
    onError: (error) => {
      toaster.toast({
        title: "Error",
        description: JSON.stringify(error),
      });
    },
    mutationFn: async (variables: {
      receiver?: string;
    }) => {
      if (!wc.data?.account) throw new Error("No account");
      if (!wc.data?.account?.address) throw new Error("No address");
      if (!props.swap.fromToken.address)
        throw new Error("No from token address");
      if (!props.swap.toToken.address) throw new Error("No to token address");
      if (!props.swap.fromAmount) throw new Error("No from amount");

      if (props.swap.fromToken.chain?.id !== props.swap.toToken.chain?.id)
        throw new Error("Cross chain not supported");

      if (wc.data.chain.id !== props.swap.fromToken.chain?.id)
        throw new Error(
          `Invalid chain --> connect to ${props.swap.fromToken.chain?.name}`,
        );

      if (!is1InchNetworkSupported(wc.data.chain.id))
        throw new Error("Network not supported");

      const blockchainProvider = new ViemWalletClientProvider({
        walletClient: wc.data,
        publicClient: pc,
      });
      if ((allowance.data ?? 0) < BigInt(1000000)) {
        console.log("increase allowance");
        const result = await increaseAllowance.writeAsync?.();
        console.log(result);
      }

      const sdk = new FusionSDK({
        url: "https://fusion.1inch.io",
        network: chainIdTo1InchNetwork(wc.data.chain.id),
        blockchainProvider,
      });

      return await sdk.placeOrder({
        fromTokenAddress: props.swap.fromToken.address,
        toTokenAddress: props.swap.toToken.address,
        amount: props.swap.fromAmount.toString(),
        walletAddress: wc.data.account.address,
        receiver: variables?.receiver ?? wc.data.account.address,
      });
    },
  });
};
