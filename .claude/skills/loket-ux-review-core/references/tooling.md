# Tooling reference

The recommended accessibility/UX toolchain, tiered by where it runs. Automated tools catch
roughly a third of issues — they are a fast first pass and a regression guard, never a verdict.
Always pair them with the manual passes in `review-playbooks.md`.

## Contents
1. The layered strategy
2. Editor / dev-time
3. Test-time & CI
4. Manual & assistive tech (irreplaceable)
5. Design-time (Figma)
6. Browser & ad-hoc
7. Suggested stack for a React/TS PWA

---

## 1. The layered strategy

Think of four layers, each catching what the previous misses:

1. **Editor** — lint as you type. Cheapest possible feedback loop.
2. **Test/CI** — automated scans on components and pages; fail the build on regressions.
3. **Manual + AT** — keyboard and screen-reader passes; the only layer that catches
   focus order, meaningful labels, and "does this flow make sense".
4. **Design** — catch contrast/target/state gaps in Figma before code exists.

The goal is to push detection as early (and as automated) as possible, while reserving human
judgement for what only humans can assess.

## 2. Editor / dev-time

- **eslint-plugin-jsx-a11y** — static a11y lint for JSX. Catches missing alt, invalid ARIA,
  non-interactive elements with handlers, etc. First line of defence.
  `pnpm add -D eslint-plugin-jsx-a11y` then extend `plugin:jsx-a11y/recommended` (or
  `strict`).
- **@axe-core/react** — logs axe violations to the dev console on every render during
  development. Live feedback without leaving the browser.
  `pnpm add -D @axe-core/react` and call it in your dev entrypoint only.
- **TypeScript** — already in the stack; strict typing of ARIA props and component contracts
  prevents a class of misuse. Type icon-button components to require an accessible name.

## 3. Test-time & CI

- **@axe-core/playwright** — run axe inside Playwright E2E tests against real rendered pages.
  `pnpm add -D @playwright/test @axe-core/playwright`. In a test:
  ```ts
  import AxeBuilder from '@axe-core/playwright';
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  ```
- **vitest-axe / jest-axe** — axe assertions in component unit tests for fast, isolated checks.
  `pnpm add -D vitest-axe` (or `jest-axe`).
- **pa11y / pa11y-ci** — a second engine (HTML_CodeSniffer/axe) with simple CLI output; good
  for crawling a list of URLs in CI. `pnpm add -D pa11y-ci`, then a `.pa11yci` config with
  your routes.
- **Lighthouse / @lhci/cli** — Lighthouse CI tracks accessibility, best-practices, PWA, and
  performance scores over time and can gate merges. `pnpm add -D @lhci/cli` then
  `lhci autorun`.
- **@storybook/addon-a11y** — runs axe on every story in the Storybook a11y panel; pairs well
  with a design-system/monorepo setup so components are audited in isolation as they are built.

CI note: all of the above run headless and fit any CI runner (this project uses GitHub Actions). Use two
engines (axe + Pa11y) for broader coverage, and store Lighthouse CI trends so regressions are
visible.

## 4. Manual & assistive tech (irreplaceable)

No automated tool tests these well — budget time for them.

- **Keyboard** — built into every machine. The single highest-value test: Tab/Shift-Tab/
  Enter/Space/Esc/arrows through the whole flow.
- **Screen readers:**
  - **Orca** (Linux/GNOME, free) — usable on Ubuntu and other Linux desktops for a first
    SR pass.
  - **NVDA** (Windows, free) — the most common testing SR; pair with Firefox/Chrome.
  - **VoiceOver** (macOS/iOS, built in) — essential for the Apple/Safari path; needs Apple HW.
  - **TalkBack** (Android, built in) — for the Android/mobile path; relevant for PWA on phones.
- **Microsoft Accessibility Insights** — guided manual "Assessment" plus FastPass automated
  checks; a structured way to do a thorough manual audit.
- **axe DevTools** / **WAVE** browser extensions — on-page automated scans with visual overlays
  while you browse.

A pragmatic minimum manual pass: keyboard-only + one screen reader + 200% zoom + reduced-motion
toggle.

## 5. Design-time (Figma)

- **Stark** — contrast checks, simulated vision differences, focus-order annotation, target
  sizing — the most complete a11y plugin.
- **Able** / **Contrast** — quick contrast sampling between two layers.
- **Adee** — target-size and contrast batch checks.
- Use these during design so contrast/target/state gaps never reach code. Annotate focus order
  and states in the file as part of handoff.

## 6. Browser & ad-hoc

- **Chrome/Edge DevTools** — Lighthouse panel, the Accessibility tree inspector, contrast
  ratio in the colour picker, and CSS Overview for contrast sweeps.
- **Firefox DevTools** — Accessibility inspector with a "check for issues" mode and a
  simulator for colour-vision differences.
- **WebAIM Contrast Checker** (web) — quick WCAG ratio lookups.
- **APCA contrast calculator** (web) — the perceptual model WCAG 3.0 is exploring; use it as a
  forward-looking sanity check, not for 2.2 conformance (2.2 still uses the ratio model).
- **Polypane** — multi-viewport browser with built-in a11y/contrast tooling for reflow checks.

## 7. Suggested stack for a React/TS PWA

A coherent, low-friction setup that matches a TypeScript + React + pnpm + monorepo context:

- **Editor:** `eslint-plugin-jsx-a11y` (recommended/strict) + `@axe-core/react` in dev.
- **Component:** Storybook with `@storybook/addon-a11y` + `vitest-axe` on critical components.
- **E2E/CI:** Playwright + `@axe-core/playwright` on key flows; `pa11y-ci` across routes;
  `@lhci/cli` to trend accessibility + PWA scores and gate merges in CI.
- **Manual cadence:** a keyboard + Orca/NVDA + 200%-zoom + reduced-motion pass before each
  release, focused on the screens that changed.
- **Design:** Stark in Figma during design, with states and focus order annotated at handoff.

Start with the editor + one CI scan; add layers as the habit sticks. Over-tooling a side
project up front tends to stall it — the keyboard pass plus jsx-a11y already removes most pain.
