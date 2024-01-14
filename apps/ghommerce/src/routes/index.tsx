import { useMutation } from "@tanstack/react-query";

import { Route } from "@tanstack/react-router";
import { rootRoute } from "./Router.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { SLIDE_IN_SLIDE_OUT_LEFT } from "@/animations.ts";
import { apiTrpc, getTrpcClientIframe } from "@/trpc-client.ts";
import { useAppDrawer } from "@/drawers/AppDrawer.tsx";

export const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});

function Index() {
  const update = useMutation({
    mutationFn: async () => {
      try {
        const parentFrame = window.parent;
        const t = getTrpcClientIframe(parentFrame);
        console.log("hello world");
        const result = await t.helloSdk.mutate({ name: "world" });
        console.log(result);
        return result;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
  });

  // 4. Use modal hook
  const modal = useWeb3Modal();
  const wagmiAccount = useAccount();

  const invoices = apiTrpc.invoices.list.useQuery();
  const drawer = useAppDrawer();
  console.log(invoices);
  return (
    <div className={SLIDE_IN_SLIDE_OUT_LEFT}>
      Wagmi Account: {wagmiAccount?.address}
      <Button
        type={"button"}
        variant={"secondary"}
        onClick={() => update.mutate()}
      >
        Click me
      </Button>

      <Separator />
      <Button onClick={() => modal.open()}>Connect Wallet</Button>
      <Button onClick={() => modal.open({ view: "Networks" })}>
        Choose Network
      </Button>
      <Button onClick={() => drawer.open({ name: "basic" })}>
        Open basic Drawer
      </Button>
      <Button onClick={() => drawer.open({ name: "advanced" })}>
        Open advanced Drawer
      </Button>
      <Separator />
    </div>
  );
}
