import type { MiddlewareHandler } from "hono";
import type { Logger } from "pino";

/**
 * Logs one structured line per request: method, path, headers, status and duration.
 * Credentials in the headers are removed by the logger's redact paths (see logger.ts).
 */
export function requestLogger(logger: Logger): MiddlewareHandler {
  return async (c, next) => {
    const start = performance.now();
    await next();
    logger.info(
      {
        req: {
          method: c.req.method,
          path: c.req.path,
          headers: Object.fromEntries(c.req.raw.headers),
        },
        res: { status: c.res.status },
        durationMs: Math.round(performance.now() - start),
      },
      "request",
    );
  };
}
