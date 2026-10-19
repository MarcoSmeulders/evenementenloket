import { TZDate } from "@date-fns/tz";
import { format, isAfter, isValid, parse } from "date-fns";
import { nl } from "date-fns/locale";

/** Kranswijk is in the Netherlands; entered dates and times are local time there. */
export const KRANSWIJK_TIME_ZONE = "Europe/Amsterdam";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** A date as a native date input produces it (`2027-06-12`) that exists in the calendar. */
export function isRealDate(value: string): boolean {
  return DATE_PATTERN.test(value) && isValid(parse(value, "yyyy-MM-dd", new Date(0)));
}

/** A time as a native time input produces it (`14:00`). */
export function isTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

/**
 * The moment an entered local date and time stand for. TZDate applies summer and winter
 * time, so this needs no offset code of our own. Expects values that passed the checks above.
 */
function makeKranswijkDate(date: string, time: string): TZDate {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return new TZDate(year, month - 1, day, hours, minutes, KRANSWIJK_TIME_ZONE);
}

export function makeInstant(date: string, time: string): Date {
  return new Date(makeKranswijkDate(date, time).getTime());
}

export function isLater(laterDate: string, laterTime: string, date: string, time: string): boolean {
  return isAfter(makeInstant(laterDate, laterTime), makeInstant(date, time));
}

export function isInFuture(date: string, time: string, now: Date): boolean {
  return isAfter(makeInstant(date, time), now);
}

/** Display form for the review page, for example "12 juni 2027, 14:00". */
export function formatDateTime(date: string, time: string): string {
  return format(makeKranswijkDate(date, time), "d MMMM yyyy, HH:mm", { locale: nl });
}
