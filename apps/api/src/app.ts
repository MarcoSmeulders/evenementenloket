import type { DestinationStream } from "pino";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HealthResponse } from "@evenementenloket/schema";
import { loadConfig, type Config } from "./config";
import { createLogger } from "./logger";
import { requestLogger } from "./middleware/request-logger";
import { problem } from "./problem";

export interface BuildAppOptions {
  /** Where log lines go. Defaults to stdout; tests pass a stream to inspect them. */
  logStream?: DestinationStream;
}

export function buildApp(config: Config, options: BuildAppOptions = {}) {
  const logger = createLogger(config, options.logStream);

  const app = new Hono();

  app.use(requestLogger(logger));

  app.notFound((c) => problem(c, 404));

  app.onError((error, c) => {
    if (error instanceof HTTPException && error.status < 500) {
      return problem(c, error.status, error.message || undefined);
    }
    logger.error({ err: error }, "unhandled error");
    // Never expose internal error messages to clients.
    return problem(c, 500);
  });

  // Routes are chained so their types end up in AppType, which the typed client uses.
  const routes = app.get("/api/health", (c) => c.json<HealthResponse>({ status: "ok" }));

  return routes;
}

export type AppType = ReturnType<typeof buildApp>;

/** Checks the configuration and builds the app, without listening. */
export function createServer(env: Record<string, string | undefined>, options?: BuildAppOptions) {
  const config = loadConfig(env);
  return { config, app: buildApp(config, options) };
}
