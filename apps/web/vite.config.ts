import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget = `http://127.0.0.1:${process.env.API_PORT ?? "3001"}`;
const proxy = { "/api": { target: apiTarget } };

export default defineConfig({
  plugins: [react()],
  server: { port: Number(process.env.WEB_PORT ?? 5173), strictPort: true, proxy },
  preview: { port: Number(process.env.WEB_PORT ?? 5173), strictPort: true, proxy },
});
