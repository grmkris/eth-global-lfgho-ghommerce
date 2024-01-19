import { Outlet, RootRoute, Router } from "@tanstack/react-router"
import * as React from "react"
import { Suspense, useEffect, useRef, useState } from "react"
import { z } from "zod"
import { indexRoute } from "./index.tsx"
import { aboutRoute } from "@/routes/about.tsx"
import {
  subPage1,
  subPage2,
  subPage3,
  subPage4,
  subPage5,
} from "@/routes/dynamic.tsx"
import { invoiceRoute } from "@/routes/invoice/invoice.tsx"
import { AppDrawer } from "@/drawers/AppDrawer.tsx"
import { swapRoute } from "@/routes/swap/swap.tsx"

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then(res => ({
          default: res.TanStackRouterDevtools,
        }))
      )

// Create a root route
export const rootRoute = new RootRoute({
  component: Root,
})

function Root() {
  const customContainerRef = useRef(null)
  const [container, setContainer] = useState(null)

  useEffect(() => {
    if (customContainerRef.current) {
      setContainer(customContainerRef.current)
    }
  }, [])

  //remove scorllbar - overflow-hidden
  return (
    <div className="flex justify-center items-center text-center h-screen overflow-hidden custom-scrollbar">
      <div
        className="inline-block relative sm:border sm:border-gray-300 sm:rounded-2xl sm:shadow-xl z-50 my-10"
        style={{
          top: "50%",
          transform: "translateY(-52%)",
          maxHeight: "calc(100% - 30px)",
        }}
      >
        <div className={"m-2"} ref={customContainerRef}>
          <Outlet />
        </div>
      </div>
      {container && <AppDrawer container={customContainerRef.current} />}
      <Suspense fallback={<div>Loading...</div>}>
        <TanStackRouterDevtools />
      </Suspense>
    </div>
  )
}

// Create the route tree using your routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  invoiceRoute,
  swapRoute,
  aboutRoute,
  subPage1,
  subPage2,
  subPage3,
  subPage4,
  subPage5,
])

// Create the router using your route tree
export const iframeRouter = new Router({ routeTree })

// Register your router for maximum type safety
declare module "@tanstack/react-router" {
  interface Register {
    routerC: typeof iframeRouter
  }
}

export const Paths = z.enum([
  "/",
  "/about",
  "/invoice",
  "/sub-page-1",
  "/sub-page-2",
  "/sub-page-3",
  "/sub-page-4",
  "/sub-page-5",
])
