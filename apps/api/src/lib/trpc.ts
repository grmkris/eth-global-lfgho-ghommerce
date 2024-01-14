import { createClient } from "@supabase/supabase-js";
import { TRPCError, initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

const t = initTRPC.context<Context>().create();

/**
 * Create a router
 * @see https://trpc.io/docs/v10/router
 */
export const router = t.router;

/**
 * Create an unprotected procedure
 * @see https://trpc.io/docs/v10/procedures
 **/
export const publicProcedure = t.procedure;

/**
 * @see https://trpc.io/docs/v10/middlewares
 */
export const middleware = t.middleware;

/**
 * @see https://trpc.io/docs/v10/merging-routers
 */
export const mergeRouters = t.mergeRouters;

export const authMiddleware = middleware((data) => {
  if (!data.ctx.isAuth) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to do this",
    });
  }
  return data.next(data);
});
export const supabase = createClient(
  "http://127.0.0.1:54321",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
);
export const authProcedure = t.procedure.use(authMiddleware);
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const { req, resHeaders } = opts;
  console.log("createContext");
  const authHeader = req.headers.get("Authorization");
  console.log("authHeader", authHeader);
  const { data: session, error } = await supabase.auth.getUser(
    authHeader?.replace("Bearer ", ""),
  );
  console.log("session", { session, error });
  if (session) {
    return {
      isAuth: true,
      session: session,
    };
  }
  return {
    isAuth: false,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
