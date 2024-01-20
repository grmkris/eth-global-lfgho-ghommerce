import { LiFi, Route } from "@lifi/sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEthersSigner } from "@/lib/useEthersSigner.tsx";
import { useAccount, useSwitchNetwork } from "wagmi";
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";
import { useToast } from "@/components/ui/use-toast.ts";

const getLifiClient = (props: {
  isTestnet?: boolean;
}) => {
  if (props.isTestnet) {
    return new LiFi({
      integrator: "Your dApp/company name",
      apiUrl: "https://staging.li.quest/v1",
    });
  }
  return new LiFi({
    integrator: "Your dApp/company name",
  });
};

export const useLifiRoutes = (props: {
  swap: SwapSchema;
}) => {
  const account = useAccount();
  return useQuery({
    retry: false,
    cacheTime: Infinity,
    staleTime: Infinity,
    enabled: !!account.address && !!props.swap.fromAmount,
    queryKey: ["lifi", "routes", props],
    queryFn: async () => {
      const lifi = getLifiClient({
        isTestnet: props.swap.isTestnet,
      });
      if (!props.swap.fromToken.chain?.id) throw new Error("Invalid chain");
      if (!props.swap.toToken.chain?.id) throw new Error("Invalid chain");
      if (!props.swap) throw new Error("Invalid order");
      if (!props.swap.fromToken.address) throw new Error("Invalid address");
      if (!props.swap.toToken.address) throw new Error("Invalid address");
      if (props.swap.fromToken.address === props.swap.toToken.address)
        throw new Error("Same token");
      return await lifi.getRoutes({
        fromAmount: props.swap.fromAmount.toString(),
        fromAddress: account.address,
        fromChainId: props.swap.fromToken.chain.id,
        fromTokenAddress: props.swap.fromToken.address,
        toAddress: props.swap.toAddress,
        toChainId: props.swap.toToken.chain.id,
        toTokenAddress: props.swap.toToken.address,
      });
    },
  });
};

export const useExecuteLifi = (props?: {
  isTestnet?: boolean;
  onExecute?: (props: { route: Route }) => void;
}) => {
  const signer = useEthersSigner();
  const { switchNetworkAsync } = useSwitchNetwork();
  const toast = useToast();

  return useMutation({
    onSuccess: (data) => {
      toast.toast({ title: "LiFi route executed", variant: "default" });
      console.log("LiFi route executed", data);
      if (props?.onExecute) props.onExecute({ route: data });
    },
    mutationFn: async (variables: {
      route: Route;
      isTestnet?: boolean;
    }) => {
      if (!signer) throw new Error("No signer");
      const lifi = getLifiClient({
        isTestnet: variables.isTestnet ?? props?.isTestnet,
      });
      return await lifi.executeRoute(signer, variables.route, {
        updateRouteHook: async (route) => {
          props?.onExecute?.({ route });
          return route;
        },
        updateTransactionRequestHook: async (transactionRequest) => {
          console.log("updateTransactionRequestHook", transactionRequest);
          return transactionRequest;
        },
        switchChainHook: async (chainId) => {
          if (!switchNetworkAsync) throw new Error("No switchNetworkAsync");
          await switchNetworkAsync(chainId);
          return signer;
        },
      });
    },
  });
};
