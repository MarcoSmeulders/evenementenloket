import { expect, type APIRequestContext, type Page } from "@playwright/test";
import { t } from "./i18n";

/** A start in the future: next year, so the tests keep working over time. */
const YEAR = String(new Date().getFullYear() + 1);

export const ORGANISER = {
  organiserType: "private",
  organisationName: "",
  contactName: "Sanne de Vries",
  email: "sanne@example.org",
  phone: "",
};

export const EVENT = {
  eventName: "Zomerfeest Kastanjelaan",
  eventType: "neighbourhood",
  eventTypeOther: "",
  location: "Grasveld achter Kastanjelaan 1-20",
  startDate: `${YEAR}-06-12`,
  startTime: "14:00",
  endDate: `${YEAR}-06-12`,
  endTime: "22:00",
  visitors: "100-499",
  description: "Een buurtfeest met muziek en een barbecue.",
};

export function draftPath(token: string, page = ""): string {
  return page ? `/aanvraag/${token}/${page}` : `/aanvraag/${token}`;
}

/** Creates a draft through the API, so a test can start in the middle of the flow. */
export async function createDraft(request: APIRequestContext): Promise<string> {
  const response = await request.post("/api/applications");
  expect(response.status()).toBe(201);
  return ((await response.json()) as { accessToken: string }).accessToken;
}

export async function saveStep(
  request: APIRequestContext,
  token: string,
  step: "organiser" | "event",
  intent: "continue" | "later",
  data: Record<string, unknown>,
) {
  const response = await request.put(`/api/my-application/steps/${step}`, {
    headers: { authorization: `Bearer ${token}` },
    data: { intent, data },
  });
  expect(response.status()).toBe(200);
}

/** Starts a report in the browser and returns the token from the address. */
export async function startReport(page: Page): Promise<string> {
  await page.goto("/");
  await page.getByRole("button", { name: t("start.button") }).click();
  await expect(page.getByRole("heading", { level: 1, name: t("link.title") })).toBeVisible();
  const match = /\/aanvraag\/([^/]+)\/link$/.exec(new URL(page.url()).pathname);
  if (!match?.[1]) throw new Error(`No token in ${page.url()}`);
  return match[1];
}

export async function fillOrganiser(page: Page) {
  await page.getByLabel(t("organiser.type.private")).check();
  await page.getByLabel(t("organiser.contactName")).fill(ORGANISER.contactName);
  await page.getByLabel(t("organiser.email")).fill(ORGANISER.email);
}

export async function fillEvent(page: Page) {
  await page.getByLabel(t("event.eventName")).fill(EVENT.eventName);
  await page.getByLabel(t("event.eventType.neighbourhood")).check();
  await page.getByLabel(t("event.location")).fill(EVENT.location);
  const start = page.getByRole("group", { name: t("event.start") });
  await start.getByLabel(t("event.date")).fill(EVENT.startDate);
  await start.getByLabel(t("event.time")).fill(EVENT.startTime);
  const end = page.getByRole("group", { name: t("event.end") });
  await end.getByLabel(t("event.date")).fill(EVENT.endDate);
  await end.getByLabel(t("event.time")).fill(EVENT.endTime);
  await page.getByLabel(t("event.visitors.100-499")).check();
  await page.getByLabel(t("event.description")).fill(EVENT.description);
}

export function pageTitle(page: string): string {
  return t("app.pageTitle", { page });
}

export async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
}
