import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import {
  arbitrum,
  avalanche,
  mainnet,
  arbitrumGoerli,
  arbitrumNova,
} from "wagmi/chains";
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * (60 * 1000), // 5 mins
      cacheTime: 10 * (60 * 1000), // 10 mins
      retry: 1,
    },
  },
});

import "./App.css";

import { WagmiConfig } from "wagmi";
import { iframeRouter } from "./routes/Router.tsx";
import { useState } from "react";
import { httpBatchLink } from "@trpc/client";
import { ENV } from "./env";
import { apiTrpc } from "@/trpc-client.ts";
import { Toaster } from "./components/ui/toaster.tsx";

const projectId = "1e69158d2921d63d074cd90b66bb038a"; // TODO move to env
if (!projectId) {
  throw new Error("VITE_PROJECT_ID is not set");
}

// 2. Create wagmiConfig
const chains = [mainnet, arbitrum, avalanche, arbitrumGoerli, arbitrumNova];
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: "Web3Modal React Example",
  },
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: "light",
  themeVariables: {
    "--w3m-color-mix": "#00DCFF",
    "--w3m-color-mix-strength": 20,
  },
});

function App() {
  const [trpc] = useState(() =>
    apiTrpc.createClient({
      links: [
        httpBatchLink({
          url: `${ENV.VITE_API_URL}/trpc`,
        }),
      ],
    }),
  );
  return (
    <WagmiConfig config={wagmiConfig}>
      <apiTrpc.Provider client={trpc} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={iframeRouter} />
          <Toaster />
          <ReactQueryDevtools initialIsOpen />
        </QueryClientProvider>
      </apiTrpc.Provider>
    </WagmiConfig>
  );
}

export default App;
