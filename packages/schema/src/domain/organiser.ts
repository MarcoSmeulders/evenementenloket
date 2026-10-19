import { z } from "zod";
import {
  isFilledIn,
  makeDraftChoice,
  makeDraftText,
  makeFormattedText,
  makeRequiredChoice,
  makeRequiredText,
} from "./fieldUtils";

export const ORGANISER_TYPES = ["private", "organisation"] as const;

const NAME_MAX = 100;
const EMAIL_MAX = 254;
const PHONE_MAX = 20;
const PHONE_PATTERN = /^\+?[0-9 ()-]{6,20}$/;

function isEmail(value: string): boolean {
  return z.email().safeParse(value).success;
}

function isPhone(value: string): boolean {
  return PHONE_PATTERN.test(value);
}

const phone = makeFormattedText(PHONE_MAX, isPhone, "invalid_phone").optional();

/** Step 1 as saved with "Opslaan en later verdergaan": formats checked, nothing required. */
export const organiserDraftSchema = z.object({
  organiserType: makeDraftChoice(ORGANISER_TYPES),
  organisationName: makeDraftText(NAME_MAX),
  contactName: makeDraftText(NAME_MAX),
  email: makeFormattedText(EMAIL_MAX, isEmail, "invalid_email").optional(),
  phone,
});
export type OrganiserDraft = z.infer<typeof organiserDraftSchema>;

/** Step 1 as saved with "Opslaan en verder", and the test for "this step is complete". */
export const organiserSchema = z
  .object({
    organiserType: makeRequiredChoice(ORGANISER_TYPES),
    organisationName: makeDraftText(NAME_MAX),
    contactName: makeRequiredText(NAME_MAX),
    email: makeRequiredText(EMAIL_MAX).refine((value) => value === "" || isEmail(value), {
      error: "invalid_email",
    }),
    phone,
  })
  .superRefine((organiser, context) => {
    if (organiser.organiserType === "organisation" && !isFilledIn(organiser.organisationName)) {
      context.addIssue({ code: "custom", path: ["organisationName"], message: "required" });
    }
  });
export type Organiser = z.infer<typeof organiserSchema>;
