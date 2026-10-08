import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { pino } from "pino";
import { describe, expect, test } from "vitest";
import { captureLogs } from "../test-support";
import { requestLogger } from "./request-logger";

function appWithLogger() {
  const logs = captureLogs();
  const app = new Hono();
  app.use(requestLogger(pino({ level: "info" }, logs.stream)));
  app.onError((error, c) => c.text("error", error instanceof HTTPException ? error.status : 500));

  // Parses the captured output: one JSON object per line.
  const entries = () =>
    logs
      .text()
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Record<string, unknown>);

  return { app, entries };
}

describe("requestLogger", () => {
  test("logs method, path, headers, status and duration once per request", async () => {
    const { app, entries } = appWithLogger();
    app.post("/api/things", (c) => c.json({ created: true }, 201));

    await app.request("/api/things?page=2", {
      method: "POST",
      headers: { "x-request-id": "abc-123" },
    });

    expect(entries()).toHaveLength(1);
    const [entry] = entries();
    expect(entry).toMatchObject({
      msg: "request",
      req: { method: "POST", path: "/api/things", headers: { "x-request-id": "abc-123" } },
      res: { status: 201 },
    });
    expect(entry?.durationMs).toEqual(expect.any(Number));
  });

  test("logs the final status when the handler throws", async () => {
    const { app, entries } = appWithLogger();
    app.get("/api/broken", () => {
      throw new Error("boom");
    });

    const response = await app.request("/api/broken");

    expect(response.status).toBe(500);
    expect(entries()).toMatchObject([{ res: { status: 500 } }]);
  });

  test("logs requests to unknown paths", async () => {
    const { app, entries } = appWithLogger();

    await app.request("/api/unknown");

    expect(entries()).toMatchObject([{ req: { path: "/api/unknown" }, res: { status: 404 } }]);
  });
});
