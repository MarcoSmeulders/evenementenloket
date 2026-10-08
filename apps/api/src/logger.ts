import { pino, type DestinationStream, type Logger } from "pino";
import type { Config } from "./config";

export function createLogger(config: Config, stream?: DestinationStream): Logger {
  return pino(
    {
      level: config.LOG_LEVEL,
      redact: {
        paths: ["req.headers.authorization", "req.headers.cookie"],
        censor: "[redacted]",
      },
    },
    stream,
  );
}
