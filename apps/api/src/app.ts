import type { DestinationStream } from "pino";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HealthResponse } from "@evenementenloket/schema";
import { loadConfig, type Config } from "./config";
import {
  makeApplicationRepository,
  openDatabase,
  type ApplicationRepository,
} from "./drafts/repository";
import { makeDraftRoutes } from "./drafts/routes";
import { createLogger } from "./logger";
import { requestLogger } from "./middleware/requestLogger";
import { problem } from "./problem";

export interface BuildAppOptions {
  /** Where log lines go. Defaults to stdout; tests pass a stream to inspect them. */
  logStream?: DestinationStream;
  /** Storage for drafts. Defaults to SQLite at the configured path. */
  repository?: ApplicationRepository;
  /** The clock. Tests pass a fixed or moving time. */
  now?: () => Date;
}

export function buildApp(config: Config, options: BuildAppOptions = {}) {
  const logger = createLogger(config, options.logStream);
  const repository =
    options.repository ?? makeApplicationRepository(openDatabase(config.DATABASE_PATH));
  const now = options.now ?? (() => new Date());

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
  const routes = app
    .get("/api/health", (c) => c.json<HealthResponse>({ status: "ok" }))
    .route("/", makeDraftRoutes(repository, now));

  return routes;
}

export type AppType = ReturnType<typeof buildApp>;

/** Checks the configuration and builds the app, without listening. */
export function createServer(
  env: Record<string, string | undefined>,
  options: BuildAppOptions = {},
) {
  const config = loadConfig(env);
  const repository =
    options.repository ?? makeApplicationRepository(openDatabase(config.DATABASE_PATH));
  return { config, repository, app: buildApp(config, { ...options, repository }) };
}
