import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ENV } from "../env";
import * as schema from "./schema";

// for migrations
export const migrationClient = new Pool({
  connectionString: ENV.DB_URL,
});

// for query purposes
export const pool = new Pool({
  connectionString: ENV.DB_URL,
});
export const db = drizzle(pool, { schema: schema });
export type db = typeof db;
