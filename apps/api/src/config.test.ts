import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { describe, expect, test } from "vitest";
import { createServer } from "./app";

describe("api-operations: Configuration checked at startup", () => {
  test("invalid configuration stops the API", () => {
    const start = () => createServer({ PORT: "not-a-port" });

    expect(start).toThrow(/PORT/);
    expect(start).not.toThrow(/not-a-port/);
  });

  test("valid configuration starts the API", async () => {
    const example = await readFile(new URL("../.env.example", import.meta.url), "utf8");
    const { app } = createServer({ ...parseEnv(example), LOG_LEVEL: "silent" });

    const response = await app.request("/api/health");

    expect(response.status).toBe(200);
  });
});
