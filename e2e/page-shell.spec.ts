import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "./support/i18n";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test.describe("page-shell: Skip link", () => {
  test("skip link is the first focus stop", async ({ page }) => {
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: t("skipLink") });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
  });

  test("skip link moves focus to the main content", async ({ page }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    await expect(page.getByRole("main")).toBeFocused();
  });
});

test.describe("page-shell: Page landmarks", () => {
  test("landmarks on the start page", async ({ page }) => {
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
  });
});

test.describe("page-shell: One heading and a unique title per page", () => {
  test("start page heading and title", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page).toHaveTitle(t("app.pageTitle", { page: t("start.title") }));
  });
});

test.describe("page-shell: Document language", () => {
  test("Dutch document language", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  });
});

test.describe("page-shell: No automatically detectable accessibility errors", () => {
  test("automated check on the start page", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe("page-shell: Content reflows at narrow widths", () => {
  test("start page at 320 pixels", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test("start page with large text on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    // Same effect as the text-size setting of a phone or browser: only text grows.
    await page.addStyleTag({ content: "html { font-size: 200%; }" });

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
});

test.describe("page-shell: Home link", () => {
  test("home link on the start page", async ({ page }) => {
    const homeLink = page.getByRole("banner").getByRole("link");
    const visibleText = `${t("app.service")} ${t("app.municipality")}`;

    await expect(homeLink).toHaveAccessibleName(new RegExp(`^${visibleText}`));
    await expect(homeLink).toHaveAttribute("aria-current", "page");
  });
});
