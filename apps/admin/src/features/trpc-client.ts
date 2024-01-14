import { createTRPCReact } from "@trpc/react-query";
import { ApiRouter } from "api/src/router.ts";

export const trpcClient = createTRPCReact<ApiRouter>();
