import { describe, expect, test } from "vitest";
import { testClient } from "hono/testing";
import {
  PROBLEM_CONTENT_TYPE,
  healthResponseSchema,
  problemDetailSchema,
} from "@evenementenloket/schema";
import { buildApp } from "./app";
import { loadConfig } from "./config";
import { captureLogs } from "./test-support";

const quietConfig = loadConfig({ LOG_LEVEL: "silent" });

describe("api-operations: Health check", () => {
  test("health check responds", async () => {
    const client = testClient(buildApp(quietConfig));

    const response = await client.api.health.$get();

    expect(response.status).toBe(200);
    expect(healthResponseSchema.parse(await response.json())).toEqual({ status: "ok" });
  });
});

describe("api-operations: No credentials in logs", () => {
  test("authorization header is redacted", async () => {
    const logs = captureLogs();
    const app = buildApp(loadConfig({ LOG_LEVEL: "info" }), { logStream: logs.stream });

    await app.request("/api/health", {
      headers: {
        authorization: "Bearer secret-token-value",
        cookie: "session=secret-cookie-value",
      },
    });

    // The request was logged, including headers, but without the credential values.
    expect(logs.text()).toContain("/api/health");
    expect(logs.text()).toContain("[redacted]");
    expect(logs.text()).not.toContain("secret-token-value");
    expect(logs.text()).not.toContain("secret-cookie-value");
  });
});

describe("api-operations: Unknown routes return a problem detail", () => {
  test("unknown path", async () => {
    const app = buildApp(quietConfig);

    const response = await app.request("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain(PROBLEM_CONTENT_TYPE);
    expect(problemDetailSchema.parse(await response.json())).toMatchObject({
      type: "about:blank",
      title: "Not Found",
      status: 404,
    });
  });
});
