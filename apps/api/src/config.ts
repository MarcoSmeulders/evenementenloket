import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().min(1).default("127.0.0.1"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_PATH: z.string().min(1).optional(),
});

/** Tests use an in-memory database, so they never need a database file. */
const DEFAULT_DATABASE_PATH = {
  development: "data/evenementenloket.sqlite",
  production: "data/evenementenloket.sqlite",
  test: ":memory:",
} as const;

export type Config = Omit<z.infer<typeof configSchema>, "DATABASE_PATH"> & {
  DATABASE_PATH: string;
};

export class ConfigError extends Error {
  readonly settings: string[];

  constructor(settings: string[]) {
    // Names only: an invalid value may be a secret pasted into the wrong setting.
    super(
      `Invalid configuration for: ${settings.join(", ")}. See .env.example for allowed values.`,
    );
    this.name = "ConfigError";
    this.settings = settings;
  }
}

export function loadConfig(env: Record<string, string | undefined>): Config {
  const result = configSchema.safeParse(env);
  if (!result.success) {
    const settings = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new ConfigError(settings);
  }
  return {
    ...result.data,
    DATABASE_PATH: result.data.DATABASE_PATH ?? DEFAULT_DATABASE_PATH[result.data.NODE_ENV],
  };
}
