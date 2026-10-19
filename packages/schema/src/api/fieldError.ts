import { z } from "zod";

/**
 * Field errors travel as codes, never as text: the web app translates them (ADR-0005).
 * Every rule in the step schemas uses one of these codes as its issue message.
 */
export const FIELD_ERROR_CODES = [
  "required",
  "too_long",
  "invalid_email",
  "invalid_phone",
  "invalid_date",
  "invalid_time",
  "invalid_option",
  "start_in_past",
  "end_before_start",
  "invalid",
] as const;

export const fieldErrorCodeSchema = z.enum(FIELD_ERROR_CODES);
export type FieldErrorCode = z.infer<typeof fieldErrorCodeSchema>;

export const fieldErrorSchema = z.object({
  field: z.string().min(1),
  code: fieldErrorCodeSchema,
});
export type FieldError = z.infer<typeof fieldErrorSchema>;

function isFieldErrorCode(value: string): value is FieldErrorCode {
  return (FIELD_ERROR_CODES as readonly string[]).includes(value);
}

/** One error per field, in the order the schema reported them. */
export function makeFieldErrors(error: z.ZodError): readonly FieldError[] {
  return error.issues.reduce<readonly FieldError[]>((errors, issue) => {
    const field = issue.path.map(String).join(".");
    if (field === "" || errors.some((existing) => existing.field === field)) return errors;
    const code = isFieldErrorCode(issue.message) ? issue.message : "invalid";
    return [...errors, { field, code }];
  }, []);
}
