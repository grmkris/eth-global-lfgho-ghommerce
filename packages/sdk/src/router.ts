import { createWindowHandler } from "trpc-browser/adapter";
import { z } from "zod";
import { actions } from "./index.ts";
import { t } from "./trpc.ts";

export const HelloSdkInput = z.object({ name: z.string() });
export type HelloSdkInput = z.infer<typeof HelloSdkInput>;

export const HelloSdkOutput = z.object({ message: z.string() });
export type HelloSdkOutput = z.infer<typeof HelloSdkOutput>;

/**
 * Functions to be called from within the iframe to the host.
 * These functions are exposed to the iframe via the `actions` prop and
 * should be registered by the host on the initialization of the iframe.
 */
export const sdkTrpcRouter = t.router({
  helloSdk: t.procedure
    .input(HelloSdkInput)
    .output(HelloSdkOutput)
    .mutation(async ({ input }) => {
      if (!actions) throw new Error("actions is 'helloSdk' undefined");
      return actions?.onHelloWorld({ name: input.name });
    }),
});

export const initTrpcWindowHandler = () => {
  if (typeof window === "undefined") throw new Error("window is undefined");
  createWindowHandler({
    router: sdkTrpcRouter,
    window: window,
    postOrigin: "*",
  });
};

export type sdkTrpcRouter = typeof sdkTrpcRouter;
