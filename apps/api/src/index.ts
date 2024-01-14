import { cors } from "@elysiajs/cors";
import { html } from "@elysiajs/html";
import { trpc } from "@elysiajs/trpc";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Elysia } from "elysia";
import { renderTrpcPanel } from "trpc-panel";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrationClient } from "./db/db";
import { apiRouter } from "./router";
import { createContext } from "./lib/trpc";

const app = new Elysia()
  .use(
    cors({
      origin: [
        "localhost:5320",
        "frontend-production-1ecc.up.railway.app",
        "localhost:5321",
      ],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: "*",
    }),
  )
  .use(
    trpc(apiRouter, {
      createContext,
    }),
  )
  .use(html())
  .get("/trpc-panel", () => {
    return renderTrpcPanel(apiRouter, {
      url: "http://localhost:8080/trpc",
    });
  })
  .onStart(async () => {
    await migrate(drizzle(migrationClient), {
      migrationsFolder: "drizzle",
    });
    console.log(
      `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
    );
    console.log("TRPC panel is running at http://localhost:8080/trpc-panel");
  })
  .listen(8080);
