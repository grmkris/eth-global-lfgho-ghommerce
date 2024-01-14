import type { Config } from "drizzle-kit";
import { ENV } from "./src/env";

export default ({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: ENV.DB_URL,
  },
} satisfies Config);
