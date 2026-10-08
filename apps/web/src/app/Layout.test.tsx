import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import nl from "../i18n/nl.json";
import { createI18n, type Translation } from "../i18n/i18n";
import { routes } from "./routes";

const PREFIX = "[x] ";

/** A copy of the Dutch translation in which every value starts with PREFIX. */
function prefixed<T>(value: T): T {
  if (typeof value === "string") return `${PREFIX}${value}` as T;
  return Object.fromEntries(
    Object.entries(value as object).map(([key, child]) => [key, prefixed(child)]),
  ) as T;
}

function visibleTexts(root: Node): string[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts: string[] = [];
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent?.trim();
    if (text) texts.push(text);
  }
  return texts;
}

describe("page-shell: Interface text from translation files", () => {
  test("text in the page frame is translated", async () => {
    const i18n = createI18n(prefixed<Translation>(nl));
    const router = createMemoryRouter(routes, { initialEntries: ["/"] });

    render(
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>,
    );
    await screen.findByRole("heading", { level: 1 });

    const texts = visibleTexts(document.body);
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) expect(text).toMatch(/^\[x\] /);

    const labelled = document.body.querySelectorAll("[aria-label]");
    for (const element of labelled) expect(element.getAttribute("aria-label")).toMatch(/^\[x\] /);

    expect(document.title).toMatch(/^\[x\] /);
  });
});
