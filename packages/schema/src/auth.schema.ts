import { z } from "zod";

export const SessionUser = z.object({
  user: z.object({
    username: z.string(),
    userId: z.string(),
  }),
  sessionId: z.string(),
});

export type SessionUser = z.infer<typeof SessionUser>;
