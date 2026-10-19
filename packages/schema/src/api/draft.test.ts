import { describe, expect, test } from "vitest";
import { accessTokenSchema, draftResponseSchema, saveStepRequestSchema } from "./draft";

describe("draft API bodies", () => {
  test("an access token is 43 URL-safe characters", () => {
    expect(accessTokenSchema.safeParse("_Q_NL3Gbh7YHOiVPFcjABOm90VmaA78o1D7x76yIGaI").success).toBe(
      true,
    );
    expect(accessTokenSchema.safeParse("too-short").success).toBe(false);
    expect(accessTokenSchema.safeParse("+".repeat(43)).success).toBe(false);
  });

  test("a save request needs a known intent and an object of data", () => {
    expect(saveStepRequestSchema.safeParse({ intent: "later", data: {} }).success).toBe(true);
    expect(saveStepRequestSchema.safeParse({ intent: "submit", data: {} }).success).toBe(false);
    expect(saveStepRequestSchema.safeParse({ intent: "later", data: "x" }).success).toBe(false);
  });

  test("an empty draft has both steps empty and not complete", () => {
    const empty = {
      status: "draft",
      steps: {
        organiser: { data: null, isComplete: false },
        event: { data: null, isComplete: false },
      },
    };
    expect(draftResponseSchema.safeParse(empty).success).toBe(true);
  });
});
