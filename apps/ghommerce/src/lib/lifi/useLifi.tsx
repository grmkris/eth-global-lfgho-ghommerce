import { LiFi, Route } from "@lifi/sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEthersSigner } from "@/lib/useEthersSigner.tsx";
import { useAccount } from "wagmi";
import { SwapSchema } from "ghommerce-schema/src/swap.schema.ts";

const lifi = new LiFi({
  integrator: "Your dApp/company name",
});
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

export const useExecuteLifi = () => {
  const signer = useEthersSigner();

  return useMutation({
    mutationFn: async (variables: {
      route: Route;
    }) => {
      if (!signer) throw new Error("No signer");
      return await lifi.executeRoute(signer, variables.route);
    },
  });
};
