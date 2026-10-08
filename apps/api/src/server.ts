import { serve } from "@hono/node-server";
import { ConfigError } from "./config";
import { createServer } from "./app";

try {
  const { config, app } = createServer(process.env);
  serve({ fetch: app.fetch, port: config.PORT, hostname: config.HOST }, (info) => {
    console.log(`API listening on http://${info.address}:${info.port}`);
  });
} catch (error) {
  console.error(error instanceof ConfigError ? error.message : error);
  process.exit(1);
}
