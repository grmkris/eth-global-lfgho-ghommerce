// main.ts
import { initTRPC } from "@trpc/server";
import { createWindowHandler } from "trpc-browser/adapter";
import { z } from "zod";
import { Paths, iframeRouter } from "./routes/Router.tsx";

const t = initTRPC.create({
  isServer: false,
  allowOutsideOfServer: true,
});

const iframeTrpcRouter = t.router({
  helloIframe: t.procedure
    .input(z.object({ name: z.string() }))
    .output(z.number())
    .mutation(async ({ input }) => {
      console.log("helloIframe", input.name);
      return 42;
    }),
  navigateToPage: t.procedure
    .input(z.object({ page: z.union([Paths, z.string()]) }))
    .output(z.string())
    .mutation(async ({ input }) => {
      await iframeRouter.navigate({ to: input.page });
      return "ok";
    }),
});

export type IframeRouter = typeof iframeTrpcRouter;

if (typeof window !== "undefined") {
  createWindowHandler({
    router: iframeTrpcRouter,
    window: window,
    postOrigin: "*",
  });
}
