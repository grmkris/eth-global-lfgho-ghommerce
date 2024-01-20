import { useMutation } from "@tanstack/react-query";

import { Route } from "@tanstack/react-router";
import { rootRoute } from "./Router.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAccount } from "wagmi";
import { SLIDE_IN_SLIDE_OUT_LEFT } from "@/animations.ts";
import { getTrpcClientIframe } from "@/trpc-client.ts";
import { useAppDrawer } from "@/drawers/AppDrawer.tsx";
import { useModal } from "connectkit";

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
  const wagmiAccount = useAccount();
  const modal = useModal();
  const drawer = useAppDrawer();
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
      <Button onClick={() => modal.openProfile()}>Connect Wallet</Button>
      <Button onClick={() => modal.openSIWE()}>Siwe</Button>
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
