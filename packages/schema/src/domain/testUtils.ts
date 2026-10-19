import type { z } from "zod";
import { makeFieldErrors, type FieldError } from "../api/fieldError";

/** The field errors of a parse result; empty when it succeeded. */
export function errorsOf(result: z.ZodSafeParseResult<unknown>): readonly FieldError[] {
  return result.success ? [] : makeFieldErrors(result.error);
}
