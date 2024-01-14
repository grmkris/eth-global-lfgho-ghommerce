// znv re-exports zod as 'z' to save a few keystrokes.
import { parseEnv, z } from "znv";

export const ENV = parseEnv(process.env, {
  DB_URL: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
});
