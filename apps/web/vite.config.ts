import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Explicit IPv4: "localhost" can resolve to ::1 (IPv6) on CI runners, while Playwright and
// the API use 127.0.0.1. Then the browser tests wait for a server they never reach.
const HOST = "127.0.0.1";
const WEB_PORT = Number(process.env.WEB_PORT ?? 5173);
const PROXY = { "/api": { target: `http://${HOST}:${process.env.API_PORT ?? "3001"}` } };

export default defineConfig({
  plugins: [react()],
  server: { host: HOST, port: WEB_PORT, strictPort: true, proxy: PROXY },
  preview: { host: HOST, port: WEB_PORT, strictPort: true, proxy: PROXY },
});
