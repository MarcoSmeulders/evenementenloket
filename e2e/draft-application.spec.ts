import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  EVENT,
  ORGANISER,
  createDraft,
  draftPath,
  fillEvent,
  fillOrganiser,
  hasHorizontalScroll,
  saveStep,
  startReport,
} from "./support/draft";
import { t } from "./support/i18n";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function heading(page: Page, name?: string) {
  return page.getByRole("heading", { level: 1, ...(name ? { name } : {}) });
}

function errorSummary(page: Page) {
  return page.getByRole("alert").filter({ hasText: t("steps.errorSummary") });
}

async function openOrganiserStep(page: Page, token: string) {
  await page.goto(draftPath(token, "organisator"));
  await expect(heading(page)).toContainText(t("steps.organiser"));
}

test.describe("draft-application: Start a draft", () => {
  test("start a report", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: t("start.button") }).click();

    await expect(heading(page, t("link.title"))).toBeVisible();
    await expect(page.getByText(/\/aanvraag\/[A-Za-z0-9_-]{43}$/)).toBeVisible();
  });
});

test.describe("draft-application: Invalid link page", () => {
  test("open an invalid link", async ({ page }) => {
    await page.goto(draftPath("A".repeat(43), "organisator"));

    await expect(heading(page, t("invalidLink.title"))).toBeVisible();
    await expect(page.getByRole("link", { name: t("invalidLink.startLink") })).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);
  });
});

test.describe("draft-application: Personal link does not leak", () => {
  test("referrer and indexing are blocked", async ({ page }) => {
    await startReport(page);

    await expect(page.locator('meta[name="referrer"]')).toHaveAttribute("content", "no-referrer");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("draft-application: Every token address opens the draft", () => {
  test("bookmark of the link page", async ({ page, browser }) => {
    await startReport(page);
    const bookmark = page.url();

    const otherSession = await browser.newContext();
    const later = await otherSession.newPage();
    await later.goto(bookmark);

    await expect(heading(later, t("link.title"))).toBeVisible();
    await otherSession.close();
  });
});

test.describe("draft-application: Link page offers ways to keep the link", () => {
  test("three ways to keep the link", async ({ page }) => {
    const token = await startReport(page);

    const link = page.getByText(new RegExp(`/aanvraag/${token}$`));
    await expect(link).toBeVisible();
    await expect(page.getByRole("button", { name: t("link.copy") })).toBeVisible();
    const mail = page.getByRole("link", { name: t("link.mail") });
    await expect(mail).toHaveAttribute("href", new RegExp(`^mailto:.*${token}`));
    const warning = page.getByText(t("link.warning"));
    const bookmarkTip = page.getByText(t("link.bookmark"));
    const isWarningFirst = await warning.evaluate(
      (element, tip) => Boolean(element.compareDocumentPosition(tip as Node) & 4),
      await bookmarkTip.elementHandle(),
    );
    expect(isWarningFirst).toBe(true);
  });

  test("link page names the retention period", async ({ page }) => {
    await startReport(page);

    await expect(page.getByText(t("link.retention", { days: "30" }))).toBeVisible();
  });

  test("copy link confirms every time", async ({ page }) => {
    // A stand-in clipboard: browsers differ in clipboard permissions, the page logic does not.
    await page.addInitScript(() => {
      const copied: string[] = [];
      Object.assign(window, { copied });
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: async (text: string) => void copied.push(text) },
      });
    });
    const token = await startReport(page);
    const status = page.getByRole("status");
    await status.evaluate((element) => {
      const shown: string[] = [];
      Object.assign(window, { shown });
      new MutationObserver(() => {
        if (element.textContent) shown.push(element.textContent);
      }).observe(element, { childList: true, characterData: true, subtree: true });
    });
    const copy = page.getByRole("button", { name: t("link.copy") });

    await copy.click();
    await expect(status).toHaveText(t("link.copied"));
    await copy.click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { shown: string[] }).shown.length))
      .toBe(2);

    const copied = await page.evaluate(() => (window as unknown as { copied: string[] }).copied);
    expect(copied).toHaveLength(2);
    expect(copied[0]).toMatch(new RegExp(`/aanvraag/${token}$`));
  });

  test("link page at 320 pixels", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await startReport(page);

    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("link page with large text on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await startReport(page);
    await page.addStyleTag({ content: "html { font-size: 200%; }" });

    expect(await hasHorizontalScroll(page)).toBe(false);
    const button = await page.getByRole("button", { name: t("link.copy") }).boundingBox();
    const block = await page.locator(".link-box").boundingBox();
    expect(button && block).toBeTruthy();
    if (button && block) expect(button.x + button.width).toBeLessThanOrEqual(block.x + block.width);
  });
});

test.describe("draft-application: Organiser step", () => {
  test("organisation name only for an organisation", async ({ page, request }) => {
    await openOrganiserStep(page, await createDraft(request));
    const organisationName = page.getByLabel(t("organiser.organisationName"));

    await page.getByLabel(t("organiser.type.organisation")).check();
    await expect(organisationName).toBeVisible();
    await page.getByLabel(t("organiser.type.private")).check();
    await expect(organisationName).toHaveCount(0);
  });
});

test.describe("draft-application: Event step", () => {
  test("start and end are named groups", async ({ page, request }) => {
    const token = await createDraft(request);
    await page.goto(draftPath(token, "evenement"));

    for (const name of [t("event.start"), t("event.end")]) {
      const group = page.getByRole("group", { name });
      await expect(group.getByLabel(t("event.date"))).toHaveAttribute("type", "date");
      await expect(group.getByLabel(t("event.time"))).toHaveAttribute("type", "time");
    }
  });
});

test.describe("draft-application: Character counter", () => {
  test("remaining characters", async ({ page, request }) => {
    const token = await createDraft(request);
    await page.goto(draftPath(token, "evenement"));
    const description = page.getByLabel(t("event.description"));

    await description.fill("a".repeat(10));

    const countText = t("event.charactersLeft", { count: "990" });
    await expect(page.getByText(countText, { exact: true })).toBeVisible();
    await expect(description).toHaveAccessibleDescription(new RegExp(countText));
  });
});

test.describe("draft-application: Save a complete step", () => {
  test("save step 1 and continue", async ({ page, request }) => {
    await openOrganiserStep(page, await createDraft(request));
    await fillOrganiser(page);

    await page.getByRole("button", { name: t("steps.saveContinue") }).click();

    await expect(heading(page)).toContainText(t("steps.event"));
    const nextElement = heading(page).locator("xpath=following-sibling::*[1]");
    await expect(nextElement).toHaveText(t("steps.saved.organiser"));
  });

  test("save step 2 and continue", async ({ page, request }) => {
    const token = await createDraft(request);
    await saveStep(request, token, "organiser", "continue", ORGANISER);
    await page.goto(draftPath(token, "evenement"));
    await fillEvent(page);

    await page.getByRole("button", { name: t("steps.saveContinue") }).click();

    await expect(heading(page)).toContainText(t("review.title"));
    await expect(page.getByText(EVENT.eventName)).toBeVisible();
    await expect(page.getByText(EVENT.description)).toBeVisible();
  });
});

test.describe("draft-application: Save a step to continue later", () => {
  test("save an incomplete step for later", async ({ page, request }) => {
    const token = await createDraft(request);
    await openOrganiserStep(page, token);
    await page.getByLabel(t("organiser.email")).fill(ORGANISER.email);

    await page.getByRole("button", { name: t("steps.saveLater") }).click();

    await expect(heading(page, t("link.saved.organiser"))).toBeVisible();
    const draft = await request.get("/api/my-application", {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(await draft.json()).toMatchObject({
      steps: { organiser: { data: { email: ORGANISER.email }, isComplete: false } },
    });
  });

  test("heading and title say the step was saved", async ({ page, request }) => {
    await openOrganiserStep(page, await createDraft(request));
    await fillOrganiser(page);

    await page.getByRole("button", { name: t("steps.saveLater") }).click();

    await expect(heading(page, t("link.saved.organiser"))).toBeFocused();
    await expect(page).toHaveTitle(new RegExp(`^${t("link.saved.organiser")}`));
  });

  test("invalid format blocks saving for later", async ({ page, request }) => {
    const token = await createDraft(request);
    await openOrganiserStep(page, token);
    await page.getByLabel(t("organiser.email")).fill("sanne@");

    await page.getByRole("button", { name: t("steps.saveLater") }).click();

    await expect(errorSummary(page)).toBeVisible();
    const draft = await request.get("/api/my-application", {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(await draft.json()).toMatchObject({ steps: { organiser: { data: null } } });
  });
});

test.describe("draft-application: Error summary", () => {
  test("invalid step", async ({ page, request }) => {
    await openOrganiserStep(page, await createDraft(request));

    await page.getByRole("button", { name: t("steps.saveContinue") }).click();

    const summary = page.locator(".error-summary");
    await expect(summary).toBeFocused();
    await expect(summary.getByRole("heading", { name: t("steps.errorSummary") })).toBeVisible();
    await expect(summary.getByRole("link")).toHaveText([
      t("errors.fields.organiserType.required"),
      t("errors.fields.contactName.required"),
      t("errors.fields.email.required"),
    ]);
    await expect(page).toHaveTitle(new RegExp(`^${t("steps.errorPrefix")}`));
  });

  test("summary link moves focus to the field", async ({ page, request }) => {
    await openOrganiserStep(page, await createDraft(request));
    await page.getByRole("button", { name: t("steps.saveContinue") }).click();

    await errorSummary(page)
      .getByRole("link", { name: t("errors.fields.email.required") })
      .click();

    await expect(page.getByLabel(t("organiser.email"))).toBeFocused();
  });

  test("field error is linked to its field", async ({ page, request }) => {
    await openOrganiserStep(page, await createDraft(request));
    await page.getByLabel(t("organiser.email")).fill("sanne@");
    await page.getByRole("button", { name: t("steps.saveContinue") }).click();

    const email = page.getByLabel(t("organiser.email"));
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAccessibleDescription(new RegExp(t("errors.generic.invalid_email")));
  });

  test("error from the server", async ({ page, request }) => {
    await openOrganiserStep(page, await createDraft(request));
    await page.route("**/api/my-application/steps/organiser", (route) =>
      route.fulfill({
        status: 422,
        contentType: "application/problem+json",
        body: JSON.stringify({
          type: "about:blank",
          title: "Unprocessable Entity",
          status: 422,
          errors: [{ field: "email", code: "invalid_email" }],
        }),
      }),
    );
    await fillOrganiser(page);

    await page.getByRole("button", { name: t("steps.saveContinue") }).click();

    await expect(
      errorSummary(page).getByRole("link", { name: t("errors.generic.invalid_email") }),
    ).toBeVisible();
    await expect(page.getByLabel(t("organiser.email"))).toHaveAccessibleDescription(
      new RegExp(t("errors.generic.invalid_email")),
    );
  });
});

test.describe("draft-application: Errors change only on submit", () => {
  test("one click submits after correcting a field", async ({ page, request }) => {
    await openOrganiserStep(page, await createDraft(request));
    await page.getByLabel(t("organiser.email")).fill("sanne@");
    await page.getByRole("button", { name: t("steps.saveLater") }).click();
    await expect(errorSummary(page)).toBeVisible();

    await page.getByLabel(t("organiser.email")).fill(ORGANISER.email);
    // A real mouse click: mousedown blurs the field before the mouseup lands on the button.
    await page.getByRole("button", { name: t("steps.saveLater") }).click();

    await expect(heading(page, t("link.saved.organiser"))).toBeVisible();
  });

  test("conditional field shows no error before submitting again", async ({ page, request }) => {
    await openOrganiserStep(page, await createDraft(request));
    await page.getByRole("button", { name: t("steps.saveContinue") }).click();
    await expect(errorSummary(page)).toBeVisible();

    await page.getByLabel(t("organiser.type.organisation")).check();

    const organisationName = page.getByLabel(t("organiser.organisationName"));
    await expect(organisationName).toBeVisible();
    await expect(organisationName).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText(t("errors.fields.organisationName.required"))).toHaveCount(0);
  });

  test("summary, field errors and title change together", async ({ page, request }) => {
    await openOrganiserStep(page, await createDraft(request));
    await page.getByRole("button", { name: t("steps.saveContinue") }).click();
    const nameError = t("errors.fields.contactName.required");
    await expect(errorSummary(page).getByRole("link", { name: nameError })).toBeVisible();

    await page.getByLabel(t("organiser.contactName")).fill(ORGANISER.contactName);
    await page.getByLabel(t("organiser.email")).focus();

    await expect(errorSummary(page).getByRole("link", { name: nameError })).toBeVisible();
    await expect(page.getByLabel(t("organiser.contactName"))).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page).toHaveTitle(new RegExp(`^${t("steps.errorPrefix")}`));
  });
});

test.describe("draft-application: Saving fails", () => {
  test("server error while saving", async ({ page, request }) => {
    await openOrganiserStep(page, await createDraft(request));
    await page.route("**/api/my-application/steps/organiser", (route) =>
      route.fulfill({ status: 500, contentType: "application/problem+json", body: "{}" }),
    );
    await fillOrganiser(page);

    await page.getByRole("button", { name: t("steps.saveContinue") }).click();

    await expect(page.locator(".alert-message")).toBeFocused();
    await expect(page.getByRole("alert")).toContainText(t("steps.saveFailedTitle"));
    await expect(page.getByLabel(t("organiser.contactName"))).toHaveValue(ORGANISER.contactName);
  });
});

test.describe("draft-application: Resume with the link", () => {
  test("resume at the first incomplete step", async ({ page, request }) => {
    const token = await createDraft(request);
    await saveStep(request, token, "organiser", "continue", ORGANISER);
    await saveStep(request, token, "event", "later", { eventName: EVENT.eventName });

    await page.goto(draftPath(token));

    await expect(heading(page)).toContainText(t("steps.event"));
    await expect(page.getByLabel(t("event.eventName"))).toHaveValue(EVENT.eventName);
  });

  test("resume a complete draft", async ({ page, request }) => {
    const token = await createDraft(request);
    await saveStep(request, token, "organiser", "continue", ORGANISER);
    await saveStep(request, token, "event", "continue", EVENT);

    await page.goto(draftPath(token));

    await expect(heading(page)).toContainText(t("review.title"));
  });

  test("continue goes where the link goes", async ({ page, request }) => {
    const token = await createDraft(request);
    await saveStep(request, token, "organiser", "continue", ORGANISER);
    await page.goto(draftPath(token, "link"));

    await page.getByRole("link", { name: t("link.continue") }).click();

    await expect(page).toHaveURL(new RegExp(`${draftPath(token, "evenement")}$`));
  });

  test("open step 2 directly", async ({ page, request }) => {
    const token = await createDraft(request);

    await page.goto(draftPath(token, "evenement"));

    await expect(heading(page)).toContainText(t("steps.event"));
  });
});

test.describe("draft-application: Read-only review page", () => {
  test("review the answers", async ({ page, request }) => {
    const token = await createDraft(request);
    await saveStep(request, token, "organiser", "continue", ORGANISER);
    await saveStep(request, token, "event", "continue", EVENT);

    await page.goto(draftPath(token, "controleren"));

    await expect(page.getByText(ORGANISER.contactName)).toBeVisible();
    await expect(page.getByText(EVENT.eventName)).toBeVisible();
    await expect(page.getByText(t("review.notYet"))).toBeVisible();
    await expect(page.getByRole("button")).toHaveCount(0);
  });

  test("review page with an incomplete step", async ({ page, request }) => {
    const token = await createDraft(request);
    await saveStep(request, token, "event", "continue", EVENT);

    await page.goto(draftPath(token, "controleren"));

    await expect(heading(page)).toContainText(t("steps.organiser"));
  });
});

test.describe("draft-application: Step position", () => {
  test("heading and step indicator agree", async ({ page, request }) => {
    const token = await createDraft(request);
    await page.goto(draftPath(token, "evenement"));

    await expect(heading(page)).toContainText(t("steps.caption", { number: "2" }));
    const steps = page.getByRole("list", { name: t("steps.label") }).getByRole("listitem");
    await expect(steps).toHaveCount(3);
    await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
    await expect(page.getByRole("navigation")).toHaveCount(0);
  });
});

test.describe("draft-application: Back link", () => {
  test("back from step 2", async ({ page, request }) => {
    const token = await createDraft(request);
    await page.goto(draftPath(token, "evenement"));
    await page.getByLabel(t("event.eventName")).fill(EVENT.eventName);

    await page.getByRole("link", { name: t("steps.back") }).click();

    await expect(heading(page)).toContainText(t("steps.organiser"));
    const draft = await request.get("/api/my-application", {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(await draft.json()).toMatchObject({ steps: { event: { data: null } } });
  });

  test("back from the review page", async ({ page, request }) => {
    const token = await createDraft(request);
    await saveStep(request, token, "organiser", "continue", ORGANISER);
    await saveStep(request, token, "event", "continue", EVENT);
    await page.goto(draftPath(token, "controleren"));

    await page.getByRole("link", { name: t("steps.back") }).click();

    await expect(heading(page)).toContainText(t("steps.event"));
  });
});

test.describe("draft-application: Keyboard and automated checks", () => {
  test("complete the flow with the keyboard only", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: t("start.button") }).focus();
    await page.keyboard.press("Enter");
    await expect(heading(page, t("link.title"))).toBeFocused();

    await page.getByRole("link", { name: t("link.continueStart") }).focus();
    await page.keyboard.press("Enter");
    await expect(heading(page)).toContainText(t("steps.organiser"));

    await page.keyboard.press("Tab");
    await expect(page.getByLabel(t("organiser.type.private"))).toBeFocused();
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await page.keyboard.type(ORGANISER.contactName);
    await page.keyboard.press("Tab");
    await page.keyboard.type(ORGANISER.email);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: t("steps.saveContinue") })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(heading(page)).toContainText(t("steps.event"));

    await page.getByLabel(t("event.eventName")).focus();
    await page.keyboard.type(EVENT.eventName);
    await page.getByLabel(t("event.eventType.neighbourhood")).focus();
    await page.keyboard.press("Space");
    await page.getByLabel(t("event.location")).focus();
    await page.keyboard.type(EVENT.location);
    // Native date and time pickers take typed input differently per browser and locale, so
    // these values are set directly; focus still moves only by keyboard.
    for (const [group, date, time] of [
      [t("event.start"), EVENT.startDate, EVENT.startTime],
      [t("event.end"), EVENT.endDate, EVENT.endTime],
    ] as const) {
      const fields = page.getByRole("group", { name: group });
      await fields.getByLabel(t("event.date")).fill(date);
      await fields.getByLabel(t("event.time")).fill(time);
    }
    await page.getByLabel(t("event.visitors.100-499")).focus();
    await page.keyboard.press("Space");
    await page.getByLabel(t("event.description")).focus();
    await page.keyboard.type(EVENT.description);
    await page.getByRole("button", { name: t("steps.saveContinue") }).focus();
    await page.keyboard.press("Enter");

    await expect(heading(page)).toContainText(t("review.title"));
  });

  test("automated check on the draft pages", async ({ page, request }) => {
    const token = await createDraft(request);
    const check = async () => {
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    };

    await page.goto(draftPath(token, "link"));
    await expect(heading(page, t("link.title"))).toBeVisible();
    await check();

    await openOrganiserStep(page, token);
    await page.getByRole("button", { name: t("steps.saveContinue") }).click();
    await expect(errorSummary(page)).toBeVisible();
    await check();

    await page.goto(draftPath(token, "evenement"));
    await expect(heading(page)).toContainText(t("steps.event"));
    await check();

    await saveStep(request, token, "organiser", "continue", ORGANISER);
    await saveStep(request, token, "event", "continue", EVENT);
    await page.goto(draftPath(token, "controleren"));
    await expect(heading(page)).toContainText(t("review.title"));
    await check();

    await page.goto(draftPath("A".repeat(43)));
    await expect(heading(page, t("invalidLink.title"))).toBeVisible();
    await check();
  });
});
