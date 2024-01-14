import { BlockchainProviderConnector, NetworkEnum } from "@1inch/fusion-sdk";
import { PublicClient, WalletClient } from "viem";
import { EIP712TypedData } from "@1inch/fusion-sdk/limit-order";

export class ViemWalletClientProvider implements BlockchainProviderConnector {
  protected readonly walletClient: WalletClient;
  protected readonly publicClient: PublicClient;
  constructor(props: {
    walletClient: WalletClient;
    publicClient: PublicClient;
  }) {
    this.walletClient = props.walletClient;
    this.publicClient = props.publicClient;
  }
  signTypedData(walletAddress: string, typedData: EIP712TypedData) {
    if (!this.walletClient.account) throw new Error("No account");
    if (
      this.walletClient.account.address.toLowerCase() !==
      walletAddress.toLowerCase()
    )
      throw new Error("Invalid account");
    return this.walletClient.signTypedData({
      ...typedData,
      account: this.walletClient.account,
    });
  }
  async ethCall(contractAddress: string, callData: string) {
    const result = await this.publicClient.call({
      account: this.walletClient.account,
      to: contractAddress as `0x${string}`,
      data: callData as `0x${string}`,
    });
    if (!result.data) throw new Error("Call failed");
    return result.data;
  }
}

export const is1InchNetworkSupported = (chainId: number) => {
  for (const network of Object.values(NetworkEnum)) {
    if (chainId === network) return true;
  }
  return false;
};

export const chainIdTo1InchNetwork = (chainId: number) => {
  for (const [network, id] of Object.entries(NetworkEnum)) {
    if (chainId === id) return NetworkEnum[network as keyof typeof NetworkEnum];
  }
  throw new Error("Invalid chain id");
};
