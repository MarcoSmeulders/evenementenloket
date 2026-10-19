import { describe, expect, test } from "vitest";
import { healthResponseSchema } from "./health";

describe("healthResponseSchema", () => {
  test("accepts status ok", () => {
    expect(healthResponseSchema.safeParse({ status: "ok" }).success).toBe(true);
  });

  test("rejects any other status", () => {
    expect(healthResponseSchema.safeParse({ status: "down" }).success).toBe(false);
  });
});
