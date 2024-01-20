import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, RootRoute, Route, Router } from "@tanstack/react-router";
import { IframeSDK } from "ghommerce-sdk/src";
import * as React from "react";
import { Suspense } from "react";
import { useBearStore } from "./store.ts";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

// Create a root route
const rootRoute = new RootRoute({
  component: Root,
});

function Root() {
  return (
    <>
      <div>
        <Link to="/">Home</Link> <Link to="/about">About</Link>
      </div>
      <hr />
      <Outlet />
      <Suspense fallback={<div>Loading...</div>}>
        {" "}
        {/* Fallback UI */}
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}

// Create an index route
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});

function Index() {
  const bears = useBearStore();
  const iframeSdk = useQuery({
    queryKey: ["iframe-sdk"],
    queryFn: async () => {
      const iframeSdk = await IframeSDK({
        url: import.meta.env.VITE_IFRAME_SDK_URL ?? "http://localhost:5321",
        actions: {
          onHelloWorld: (param) => {
            console.log("hello world", param.name);
            bears.increase(1);
            return { message: "hello world" };
          },
        },
      });
      return iframeSdk;
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });

  return (
    <div>
      <h3>Welcome Home! {bears.bears}</h3>
      <button type={"button"} onClick={() => iframeSdk.data?.showIframeModal()}>
        show modal
      </button>
      <button type={"button"} onClick={() => iframeSdk.data?.hideIframeModal()}>
        hide modal
      </button>
      <button
        type={"button"}
        onClick={() =>
          iframeSdk.data?.iframeClient.helloIframe.mutate({ name: "world" })
        }
      >
        trpc
      </button>
      <button
        type={"button"}
        onClick={() =>
          iframeSdk.data?.iframeClient.navigateToPage.mutate({
            page: "/sub-page-1",
          })
        }
      >
        go to sub-page-1
      </button>
      <button
        type={"button"}
        onClick={() =>
          iframeSdk.data?.iframeClient.navigateToPage.mutate({
            page: "/invoice?id=6e587eac-1c3c-4e7e-b5b0-a8dcb072c6ac",
          })
        }
      >
        go to sub-page-2
      </button>
      <button
        type={"button"}
        onClick={() =>
          iframeSdk.data?.iframeClient.navigateToPage.mutate({
            page: "/sub-page-3",
          })
        }
      >
        go to sub-page-3
      </button>
      <button
        type={"button"}
        onClick={() =>
          iframeSdk.data?.iframeClient.navigateToPage.mutate({ page: "/" })
        }
      >
        go to home
      </button>
    </div>
  );
}

const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: About,
});

function About() {
  return <div>Hello from About!</div>;
}

// Create the route tree using your routes
const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);

// Create the router using your route tree
export const exampleRouter = new Router({ routeTree });

// Register your router for maximum type safety
declare module "@tanstack/react-router" {
  interface Register {
    exampleRouter: typeof exampleRouter;
  }
}
