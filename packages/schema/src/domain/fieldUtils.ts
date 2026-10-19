import { z } from "zod";

/*
 * Building blocks for the step schemas. A form sends "" for an empty text field and null
 * for a radio group without a choice. In a draft that means "not filled in yet"; only the
 * complete schemas require a value.
 */

/** Text in a draft: empty is fine, too long is not. */
export function makeDraftText(maxLength: number) {
  return z.string({ error: "invalid" }).trim().max(maxLength, { error: "too_long" }).optional();
}

/** Text in a complete step: required and not too long. */
export function makeRequiredText(maxLength: number) {
  return z
    .string({ error: "required" })
    .trim()
    .min(1, { error: "required" })
    .max(maxLength, { error: "too_long" });
}

/** Text with a format check that only applies once something is filled in. */
export function makeFormattedText(
  maxLength: number,
  isValidFormat: (value: string) => boolean,
  code: string,
) {
  return z
    .string({ error: "invalid" })
    .trim()
    .max(maxLength, { error: "too_long" })
    .refine((value) => value === "" || isValidFormat(value), { error: code });
}

/** A choice in a draft: no choice yet is fine, an unknown value is not. */
export function makeDraftChoice<const T extends readonly [string, ...string[]]>(options: T) {
  return z.enum(options, { error: "invalid_option" }).nullable().optional();
}

/** A choice in a complete step. */
export function makeRequiredChoice<const T extends readonly [string, ...string[]]>(options: T) {
  return z.enum(options, {
    error: (issue) =>
      issue.input === undefined || issue.input === null ? "required" : "invalid_option",
  });
}

export function isFilledIn(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim() !== "";
}
