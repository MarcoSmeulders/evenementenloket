import { describe, expect, test } from "vitest";
import { formatDateTime, isRealDate, makeInstant } from "./dateTimeUtils";

describe("dateTimeUtils", () => {
  test("local time in Kranswijk follows winter and summer time", () => {
    expect(makeInstant("2027-01-15", "12:00").toISOString()).toBe("2027-01-15T11:00:00.000Z");
    expect(makeInstant("2027-06-15", "12:00").toISOString()).toBe("2027-06-15T10:00:00.000Z");
  });

  test("only real calendar dates pass", () => {
    expect(isRealDate("2028-02-29")).toBe(true);
    expect(isRealDate("2027-02-29")).toBe(false);
    expect(isRealDate("12-06-2027")).toBe(false);
  });

  test("dates are shown in Dutch", () => {
    expect(formatDateTime("2027-06-12", "14:00")).toBe("12 juni 2027, 14:00");
  });
});
