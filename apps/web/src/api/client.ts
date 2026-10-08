import { hc } from "hono/client";
import type { AppType } from "@evenementenloket/api";

/**
 * Typed client for the API. Routes, inputs and responses come from the API's own
 * types, so a change on the API side shows up here as a type error.
 * Only the type is imported: no API code ends up in the browser bundle.
 */
export const api = hc<AppType>("/");
