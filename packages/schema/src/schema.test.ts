import { describe, expect, test } from "vitest";
import { healthResponseSchema, problemDetailSchema } from "./index";

describe("healthResponseSchema", () => {
  test("accepts status ok", () => {
    expect(healthResponseSchema.safeParse({ status: "ok" }).success).toBe(true);
  });

  test("rejects any other status", () => {
    expect(healthResponseSchema.safeParse({ status: "down" }).success).toBe(false);
  });
});

describe("problemDetailSchema", () => {
  test("accepts a minimal problem detail", () => {
    const result = problemDetailSchema.safeParse({
      type: "about:blank",
      title: "Not Found",
      status: 404,
    });
    expect(result.success).toBe(true);
  });

  test("rejects a success status code", () => {
    const result = problemDetailSchema.safeParse({ type: "about:blank", title: "OK", status: 200 });
    expect(result.success).toBe(false);
  });

  test("rejects a missing title", () => {
    const result = problemDetailSchema.safeParse({ type: "about:blank", status: 500 });
    expect(result.success).toBe(false);
  });
});
