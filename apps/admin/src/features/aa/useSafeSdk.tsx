import Safe, {
  EthersAdapter,
  PredictedSafeProps,
} from "@safe-global/protocol-kit";
import { useQuery } from "@tanstack/react-query";
import { Signer, ethers } from "ethers";

export const useSafeSdk = (props: {
  address?: string;
  signer?: Signer;
  nonce?: string;
}) => {
  const safeSdk = useQuery({
    queryKey: ["useSafeSdk", props.address, props.nonce],
    enabled: !!props.signer && !!props.address,
    queryFn: async () => {
      if (!props.signer) throw new Error("No signer");
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: props.signer,
      });
      const address = await props.signer.getAddress();

      console.log("useSafeSdk address", address);
      const safeAccountConfig: PredictedSafeProps = {
        safeAccountConfig: {
          threshold: 1,
          owners: [address],
        },
        safeDeploymentConfig: {
          saltNonce: props.nonce,
        },
      };
      const createdSafe = await Safe.create({
        ethAdapter,
        predictedSafe: safeAccountConfig,
      });
      console.log("useSafeSdk createdSafe 1 ", createdSafe);
      const safeAddress = await createdSafe.getAddress();
      console.log("useSafeSdk createdSafe 2 ", { safeAddress });

      const isDeployed = await createdSafe.isSafeDeployed();
      console.log("useSafeSdk isDeployed 3 ", { isDeployed });

      return createdSafe;
    },
  });

  const safeAddress = useQuery({
    queryKey: ["safeAddress", safeSdk.data],
    enabled: !!safeSdk.data,
    queryFn: async () => {
      return safeSdk.data?.getAddress();
    },
  });

  return {
    safeAddress,
  };
};
