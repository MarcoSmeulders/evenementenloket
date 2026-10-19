import { describe, expect, test } from "vitest";
import { problemDetailSchema } from "./problemDetail";

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

  test("a problem detail may list field errors as codes", () => {
    const body = {
      type: "about:blank",
      title: "Unprocessable Content",
      status: 422,
      errors: [{ field: "email", code: "invalid_email" }],
    };
    expect(problemDetailSchema.safeParse(body).success).toBe(true);
    expect(
      problemDetailSchema.safeParse({ ...body, errors: [{ field: "email", code: "Ongeldig" }] })
        .success,
    ).toBe(false);
  });
});
