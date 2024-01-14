import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import * as path from "node:path";
import {nodePolyfills} from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5320,
  },
});
