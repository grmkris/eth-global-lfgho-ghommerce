import { createTRPCReact } from "@trpc/react-query";
import { ApiRouter } from "backend/src/router.ts";
import { createTRPCProxyClient } from "@trpc/client";
import { sdkTrpcRouter } from "iframe-sdk/src/router.ts";
import { windowLink } from "trpc-browser/link";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const apiTrpc = createTRPCReact<ApiRouter>();
export type RouterInput = inferRouterInputs<ApiRouter>;
export type RouterOutput = inferRouterOutputs<ApiRouter>;

export function getTrpcClientIframe(iframe: Window) {
  return createTRPCProxyClient<sdkTrpcRouter>({
    links: [
      windowLink({
        window: window,
        postWindow: iframe,
        postOrigin: "*", // TODO narrow this down
      }),
    ],
  });
}
