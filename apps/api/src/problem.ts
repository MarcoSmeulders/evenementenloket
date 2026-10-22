import { STATUS_CODES } from "node:http";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { PROBLEM_CONTENT_TYPE, type ProblemDetail } from "@evenementenloket/schema";

/** Extension members a problem detail may carry, such as field error codes. */
type ProblemExtensions = Pick<ProblemDetail, "errors">;

export function problem(
  c: Context,
  status: ContentfulStatusCode,
  detail?: string,
  extensions: ProblemExtensions = {},
) {
  const body: ProblemDetail = {
    type: "about:blank",
    title: STATUS_CODES[status] ?? "Error",
    status,
    ...(detail === undefined ? {} : { detail }),
    ...extensions,
  };
  return c.body(JSON.stringify(body), status, { "Content-Type": PROBLEM_CONTENT_TYPE });
}
