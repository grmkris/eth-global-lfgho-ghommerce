// znv re-exports zod as 'z' to save a few keystrokes.
import { parseEnv, z } from "znv";

export const ENV = parseEnv(import.meta.env, {
  VITE_API_URL: z.string(),
});
