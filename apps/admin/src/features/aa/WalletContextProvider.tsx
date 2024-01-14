import {
  AuthKitSignInData,
  SafeAuthInitOptions,
  SafeAuthPack,
} from "@safe-global/auth-kit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useDisconnect,
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { BrowserProvider, Eip1193Provider, Signer } from "ethers";
import React, { createContext, useContext, useEffect, useState } from "react";

export type WalletContext = {
  web3Auth?: {
    signIn: () => void;
    signOut: () => void;
    signer?: Signer;
    address?: string;
  };
  web3Modal?: {
    signIn: () => void;
    signOut: () => void;
    signer?: Signer;
    address?: string;
  };
  signOut: () => void;
  signer?: Signer;
  address?: string;
  signMessage: (message: string) => Promise<string>;
};
// Define the context
const WalletContext = createContext<WalletContext | null>(null);

export const WalletContextProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [web3Auth, setWeb3Auth] = useState<SafeAuthPack>();
  const disconnect = useDisconnect();
  const queryClient = useQueryClient();
  const { address } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const web3Modal = useWeb3Modal();
  const [safeAuth, setSafeAuth] = useState<SafeAuthPack>();
  const [provider, setProvider] = useState<Eip1193Provider | null>(null);
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
    useState<AuthKitSignInData | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const safeAuthPack = new SafeAuthPack();
        const safeAuthInitOptions: SafeAuthInitOptions = {
          showWidgetButton: false,
          chainConfig: {
            blockExplorerUrl: "https://goerli.etherscan.io",
            chainId: "0x5",
            displayName: "Ethereum Goerli",
            rpcTarget: "https://rpc.ankr.com/eth_goerli",
            ticker: "ETH",
            tickerName: "Ethereum",
          },
        };

        await safeAuthPack.init(safeAuthInitOptions);

        console.log("safeAuthPack", safeAuthPack);

        setSafeAuth(safeAuthPack);
        if (safeAuthPack.isAuthenticated) {
          const signInInfo = await safeAuthPack?.signIn();
          setSafeAuthSignInResponse(signInInfo);
          setProvider(safeAuthPack.getProvider() as Eip1193Provider);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const signInWeb3Auth = useMutation({
    mutationFn: async () => {
      if (!safeAuth) throw new Error("No safeAuth");
      const result = await safeAuth?.signIn();
      if (!result) throw new Error("No result");
      await queryClient.invalidateQueries();
      setWeb3Auth(safeAuth);
      setSafeAuthSignInResponse(result);
      setProvider(safeAuth?.getProvider() as Eip1193Provider);
      return result;
    },
  });

  const signerWeb3Auth = useQuery({
    enabled: !!signInWeb3Auth.data?.eoa,
    queryKey: ["useWeb3Auth signerWeb3Auth", signInWeb3Auth.data?.eoa],
    queryFn: async () => {
      const safeProvider = web3Auth?.getProvider();
      if (!safeProvider) throw new Error("No provider");
      const provider = new BrowserProvider(safeProvider);
      console.log("useWeb3Auth signerWeb3Auth 1", provider);
      const signer = await provider.getSigner();
      console.log("useWeb3Auth signerWeb3Auth 2", signer);
      return signer;
    },
  });

  const signOutWeb3Auth = useMutation({
    mutationFn: async () => {
      if (!web3Auth) throw new Error("No web3Auth");
      await web3Auth?.signOut({ reset: true });
      await queryClient.invalidateQueries();
    },
  });

  const signInWeb3Modal = useMutation({
    mutationFn: async () => {
      await web3Modal.open();
    },
  });

  const signOutWeb3Modal = useMutation({
    mutationFn: async () => {
      await disconnect.disconnect();
    },
  });

  const signerWeb3Modal = useQuery({
    enabled: !!address && !!walletProvider,
    queryKey: ["signerWeb3Modal", address],
    queryFn: async () => {
      if (!walletProvider) throw new Error("No provider");
      const ethersProvider = new BrowserProvider(walletProvider);
      return await ethersProvider.getSigner();
    },
  });

  const value = {
    web3Auth: {
      signIn: signInWeb3Auth.mutate,
      signOut: signOutWeb3Auth.mutate,
      signer: signerWeb3Auth.data,
      address: signInWeb3Auth.data?.eoa,
    },
    web3Modal: {
      signIn: signInWeb3Modal.mutate,
      signOut: signOutWeb3Modal.mutate,
      signer: signerWeb3Modal.data,
      address: address,
    },
    signOut: () => {
      if (signInWeb3Auth.data?.eoa) signOutWeb3Auth.mutate();
      if (address) signOutWeb3Modal.mutate();
    },
    signer: signerWeb3Auth.data ?? signerWeb3Modal.data,
    address: signInWeb3Auth.data?.eoa ?? address,
    signMessage: async (message: string) => {
      if (signerWeb3Auth.data) {
        const signature = await signerWeb3Auth.data.signMessage(message);
        return signature;
      }
      if (signerWeb3Modal.data) {
        const signature = await signerWeb3Modal.data.signMessage(message);
        return signature;
      }
      throw new Error("No signer");
    },
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("No WalletContextProvider");
  return context;
};
