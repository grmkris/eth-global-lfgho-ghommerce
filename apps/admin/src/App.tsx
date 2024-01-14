import {
  TrpcProvider,
  queryClient,
  supabase,
} from "@/features/TrpcProvider.tsx";
import { WalletContextProvider } from "@/features/aa/WalletContextProvider.tsx";
import { authOnboardingRoute, authRoute } from "@/routes/authRoute.tsx";
import { dashboardRoute } from "@/routes/dashboardRoute.tsx";
import { indexRoute } from "@/routes/indexRoute.tsx";
import { loginRoute } from "@/routes/loginRoute.tsx";
import { Session } from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import {
  Router,
  RouterProvider,
  rootRouteWithContext,
} from "@tanstack/react-router";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

const projectId = "bb5b12992cbf95ff3d7bc9bb1526c9d9";

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};

// 3. Create modal
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com",
  icons: ["https://avatars.mywebsite.com/"],
};
export const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet],
  projectId,
});

export type RouterContext = {
  supabase: typeof supabase;
  queryClient: QueryClient;
  session?: Session;
};

export const rootRoute = rootRouteWithContext<RouterContext>()();

export const App = () => {
  return (
    <TrpcProvider>
      <WalletContextProvider>
        <RouterProvider router={router} />
      </WalletContextProvider>
    </TrpcProvider>
  );
};

// Create the route tree using your root and dynamically generated entity routes
const routeTree = rootRoute.addChildren([
  authRoute.addChildren([
    dashboardRoute,
  ]),
  authOnboardingRoute.addChildren([indexRoute]),
  loginRoute,
]);
// Create the router using your route tree
const router = new Router({
  routeTree,
  context: {
    supabase,
    queryClient,
  },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
});
