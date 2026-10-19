import { z } from "zod";
import { isInFuture, isLater, isRealDate, isTime } from "../dateTimeUtils";
import {
  isFilledIn,
  makeDraftChoice,
  makeDraftText,
  makeFormattedText,
  makeRequiredChoice,
  makeRequiredText,
} from "./fieldUtils";

export const EVENT_TYPES = ["market", "sports", "music", "neighbourhood", "other"] as const;
export const VISITOR_GROUPS = ["under-100", "100-499", "500-1999", "2000-plus"] as const;

const NAME_MAX = 100;
const LOCATION_MAX = 200;
export const DESCRIPTION_MAX = 1000;
const DATE_MAX = 10;
const TIME_MAX = 5;

const date = makeFormattedText(DATE_MAX, isRealDate, "invalid_date");
const time = makeFormattedText(TIME_MAX, isTime, "invalid_time");

/** Step 2 as saved with "Opslaan en later verdergaan": formats checked, nothing required. */
export const eventDraftSchema = z.object({
  eventName: makeDraftText(NAME_MAX),
  eventType: makeDraftChoice(EVENT_TYPES),
  eventTypeOther: makeDraftText(NAME_MAX),
  location: makeDraftText(LOCATION_MAX),
  startDate: date.optional(),
  startTime: time.optional(),
  endDate: date.optional(),
  endTime: time.optional(),
  visitors: makeDraftChoice(VISITOR_GROUPS),
  description: makeDraftText(DESCRIPTION_MAX),
});
export type EventDraft = z.infer<typeof eventDraftSchema>;

function makeRequired(schema: typeof date) {
  return z.string({ error: "required" }).pipe(schema).refine(isFilledIn, { error: "required" });
}

/**
 * Step 2 as saved with "Opslaan en verder", and the test for "this step is complete".
 * "Now" is passed in, so the rule "start in the future" can be tested at a fixed time.
 */
export function makeEventSchema(now: Date) {
  return z
    .object({
      eventName: makeRequiredText(NAME_MAX),
      eventType: makeRequiredChoice(EVENT_TYPES),
      eventTypeOther: makeDraftText(NAME_MAX),
      location: makeRequiredText(LOCATION_MAX),
      startDate: makeRequired(date),
      startTime: makeRequired(time),
      endDate: makeRequired(date),
      endTime: makeRequired(time),
      visitors: makeRequiredChoice(VISITOR_GROUPS),
      description: makeRequiredText(DESCRIPTION_MAX),
    })
    .superRefine((event, context) => {
      if (event.eventType === "other" && !isFilledIn(event.eventTypeOther)) {
        context.addIssue({ code: "custom", path: ["eventTypeOther"], message: "required" });
      }
      if (!isInFuture(event.startDate, event.startTime, now)) {
        context.addIssue({ code: "custom", path: ["startDate"], message: "start_in_past" });
      }
      if (!isLater(event.endDate, event.endTime, event.startDate, event.startTime)) {
        context.addIssue({ code: "custom", path: ["endDate"], message: "end_before_start" });
      }
    });
}
export type Event = z.infer<ReturnType<typeof makeEventSchema>>;
