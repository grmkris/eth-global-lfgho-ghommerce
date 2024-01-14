import { createTRPCReact } from "@trpc/react-query";
import { ApiRouter } from "backend/src/router.ts";

export const trpcClient = createTRPCReact<ApiRouter>();
