import { defineConfig, devices } from "@playwright/test";

const apiPort = process.env.API_PORT ?? "3001";
const webPort = process.env.WEB_PORT ?? "5173";
const baseURL = `http://127.0.0.1:${webPort}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  // Browser tests start the API and a production build of the web app themselves.
  webServer: [
    {
      command: "pnpm --filter @evenementenloket/api exec tsx src/server.ts",
      url: `http://127.0.0.1:${apiPort}/api/health`,
      env: { PORT: apiPort, LOG_LEVEL: "warn", NODE_ENV: "test" },
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "pnpm --filter @evenementenloket/web build && pnpm --filter @evenementenloket/web preview",
      url: baseURL,
      env: { API_PORT: apiPort, WEB_PORT: webPort },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
