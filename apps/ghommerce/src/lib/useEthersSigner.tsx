import { WalletClient } from "viem";
import { providers } from "ethers";
import { useWalletClient } from "wagmi";
import { useMemo } from "react";

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  if (!account || !chain || !transport)
    throw new Error("Invalid wallet client");
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  return provider.getSigner(account?.address);
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient],
  );
}
