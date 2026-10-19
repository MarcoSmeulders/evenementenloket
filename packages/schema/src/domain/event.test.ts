import { describe, expect, test } from "vitest";
import { eventDraftSchema, makeEventSchema } from "./event";
import { errorsOf } from "./testUtils";

const NOW = new Date("2027-01-15T10:00:00Z");

const COMPLETE = {
  eventName: "Zomerfeest Kastanjelaan",
  eventType: "neighbourhood",
  eventTypeOther: "",
  location: "Grasveld achter Kastanjelaan 1-20",
  startDate: "2027-06-12",
  startTime: "14:00",
  endDate: "2027-06-12",
  endTime: "22:00",
  visitors: "100-499",
  description: "Een buurtfeest met muziek en een barbecue.",
};

function errorsFor(input: Record<string, unknown>, now = NOW) {
  return errorsOf(makeEventSchema(now).safeParse(input));
}

describe("draft-application: Event step", () => {
  test("other type needs a description", () => {
    expect(errorsFor({ ...COMPLETE, eventType: "other", eventTypeOther: "" })).toEqual([
      { field: "eventTypeOther", code: "required" },
    ]);
  });

  test("start in the past", () => {
    // 28 March 2027: summer time starts at 01:00 UTC. 03:30 local time is 01:30 UTC, so at
    // 01:45 UTC the start has passed. Winter time by mistake would give 02:30 UTC: "future".
    const now = new Date("2027-03-28T01:45:00Z");
    const event = {
      ...COMPLETE,
      startDate: "2027-03-28",
      startTime: "03:30",
      endDate: "2027-03-28",
    };
    expect(errorsFor(event, now)).toEqual([{ field: "startDate", code: "start_in_past" }]);
  });

  test("end before start", () => {
    expect(errorsFor({ ...COMPLETE, endTime: "14:00" })).toEqual([
      { field: "endDate", code: "end_before_start" },
    ]);
  });

  test("description too long", () => {
    const result = eventDraftSchema.safeParse({ description: "a".repeat(1001) });
    expect(errorsOf(result)).toEqual([{ field: "description", code: "too_long" }]);
  });
});

describe("event schemas", () => {
  test("a complete event step is accepted", () => {
    expect(errorsFor(COMPLETE)).toEqual([]);
  });

  test("a draft may leave everything empty but rejects a date that does not exist", () => {
    expect(eventDraftSchema.safeParse({ eventName: "", visitors: null }).success).toBe(true);
    const result = eventDraftSchema.safeParse({ startDate: "2027-02-30", startTime: "25:00" });
    expect(errorsOf(result)).toEqual([
      { field: "startDate", code: "invalid_date" },
      { field: "startTime", code: "invalid_time" },
    ]);
  });

  test("a complete step reports missing fields as required", () => {
    expect(errorsFor({ eventName: "" }).map((error) => error.code)).toEqual(
      Array(9).fill("required"),
    );
  });
});
