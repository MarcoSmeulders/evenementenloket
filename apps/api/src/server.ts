import { serve } from "@hono/node-server";
import { ConfigError } from "./config";
import { createServer } from "./app";
import { startDraftCleanup } from "./drafts/retention";

try {
  const { config, repository, app } = createServer(process.env);
  serve({ fetch: app.fetch, port: config.PORT, hostname: config.HOST }, (info) => {
    console.log(`API listening on http://${info.address}:${info.port}`);
  });
  // Deletes drafts not saved for 30 days: now, and then every 24 hours.
  startDraftCleanup(
    repository,
    () => new Date(),
    (deleted) => {
      if (deleted > 0) console.log(`Deleted ${deleted} expired draft(s)`);
    },
  );
} catch (error) {
  console.error(error instanceof ConfigError ? error.message : error);
  process.exit(1);
}
