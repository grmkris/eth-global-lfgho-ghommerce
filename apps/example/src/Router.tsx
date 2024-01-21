import { Link, Outlet, RootRoute, Route, Router } from "@tanstack/react-router";
import * as React from "react";
import { Suspense, useState } from "react";
import { useGhommerceSDK } from "./useGhommerceSDK.tsx";

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
  const ghommerceSDK = useGhommerceSDK();
  const [donationId, setDonationId] = useState<string | undefined>();
  const [invoiceId, setInvoiceId] = useState<string | undefined>();

  return (
    <div className="p-4">
      <h3>Welcome to GHOmerce example application</h3>
      <p>
        This is an example application that uses the GHOmerce SDK to show how to
        integrate with GHOmerce payment widget
      </p>
      <hr />
      <div className="flex flex-col gap-1">
        <label>
          Input the <b>invoice id</b> that you want to expose through SDK:{" "}
        </label>
        <input
          type="text"
          id="fname"
          name="invoiceId"
          value={invoiceId}
          onChange={(input) => setInvoiceId(input.target.value)}
        />
        {donationId !== "" && <p>Current invoice ID: {invoiceId}</p>}
        <button
          type={"button"}
          onClick={() => {
            ghommerceSDK.data?.showIframeModal();
            ghommerceSDK.data?.iframeClient.navigateToPage.mutate({
              page: `/invoice?id=${invoiceId}`,
            });
          }}
        >
          Open invoice
        </button>
      </div>
      <hr />
      <div className="flex flex-col gap-1">
        <label>
          Input the <b>donation id</b> that you want to expose through SDK:{" "}
        </label>
        <input
          type="text"
          id="fname"
          name="donationId"
          value={donationId}
          onChange={(input) => setDonationId(input.target.value)}
        />
        {donationId !== "" && <p>Current donationId ID: {donationId}</p>}
        <button
          type={"button"}
          onClick={() => {
            ghommerceSDK.data?.showIframeModal();
            ghommerceSDK.data?.iframeClient.navigateToPage.mutate({
              page: `/donation?id=${donationId}`,
            });
          }}
        >
          Open donation
        </button>
      </div>
      <hr />
      <button
        type={"button"}
        onClick={() => ghommerceSDK.data?.showIframeModal()}
      >
        show sdk
      </button>
      <button
        type={"button"}
        onClick={() => ghommerceSDK.data?.hideIframeModal()}
      >
        hide sdk
      </button>

      <button
        type={"button"}
        onClick={() =>
          ghommerceSDK.data?.iframeClient.navigateToPage.mutate({ page: "/" })
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
