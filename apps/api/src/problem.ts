import { STATUS_CODES } from "node:http";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { PROBLEM_CONTENT_TYPE, type ProblemDetail } from "@evenementenloket/schema";

export function problem(c: Context, status: ContentfulStatusCode, detail?: string) {
  const body: ProblemDetail = {
    type: "about:blank",
    title: STATUS_CODES[status] ?? "Error",
    status,
    ...(detail === undefined ? {} : { detail }),
  };
  return c.body(JSON.stringify(body), status, { "Content-Type": PROBLEM_CONTENT_TYPE });
}
