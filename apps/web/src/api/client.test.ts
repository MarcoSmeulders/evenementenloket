import type { InferResponseType } from "hono/client";
import { describe, expectTypeOf, test } from "vitest";
import type { HealthResponse } from "@evenementenloket/schema";
import { api } from "./client";

describe("typed API client", () => {
  test("health response type comes from the API", () => {
    // Checked by the type checker: if the API changes this response, typecheck fails.
    expectTypeOf<InferResponseType<typeof api.api.health.$get>>().toEqualTypeOf<HealthResponse>();
  });
});
