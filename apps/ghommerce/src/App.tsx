import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { RouterProvider } from "@tanstack/react-router"
import { WagmiConfig, createConfig, configureChains } from "wagmi"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"
import {
  arbitrum,
  avalanche,
  mainnet,
  arbitrumGoerli,
  arbitrumNova,
} from "wagmi/chains"
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * (60 * 1000), // 5 mins
      cacheTime: 10 * (60 * 1000), // 10 mins
      retry: 1,
    },
  },
})

import { iframeRouter } from "./routes/Router.tsx"
import { useState } from "react"
import { httpBatchLink } from "@trpc/client"
import { ENV } from "./env"
import { apiTrpc } from "@/trpc-client.ts"
import { Toaster } from "./components/ui/toaster.tsx"

const projectId = "1e69158d2921d63d074cd90b66bb038a" // TODO move to env
if (!projectId) {
  throw new Error("VITE_PROJECT_ID is not set")
}

// 2. Create wagmiConfig
const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: "alcht_tHlvJglVFgwX9ziJkvc09fXSInaLuO", // Replace with your Alchemy ID
    walletConnectProjectId: "ghommerce", // Replace with your WalletConnect Project ID

    // Required
    appName: "GHOmmerce", // Replace with the name of your app

    // Optional
    appDescription: "GHOmmerce app", // Replace with a short description of your app
    appUrl: "https://ghommerce.com", // Replace with the URL of your app
    appIcon: "https://ghommerce.com/", // Replace with the URL of your app's icon
  })
)

function App() {
  const [trpc] = useState(() =>
    apiTrpc.createClient({
      links: [
        httpBatchLink({
          url: `${ENV.VITE_API_URL}/trpc`,
        }),
      ],
    })
  )
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <apiTrpc.Provider client={trpc} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={iframeRouter} />
            <Toaster />
            <ReactQueryDevtools initialIsOpen />
          </QueryClientProvider>
        </apiTrpc.Provider>
      </ConnectKitProvider>
    </WagmiConfig>
  )
}

export default App
