# Tasks

## 1. Workspace and tooling

- [ ] 1.1 Add root `package.json` (private, `packageManager` pinned to the installed pnpm), `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `.nvmrc` (Node 24) and `.editorconfig`; verify `pnpm install` succeeds on a clean checkout
- [ ] 1.2 Add `tsconfig.base.json` (strict, `noUncheckedIndexedAccess`, `moduleResolution: bundler`) and a root `typecheck` script that runs `tsc --noEmit` per package; verify it passes on the empty packages
- [ ] 1.3 Add ESLint (flat config) with `typescript-eslint`, `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y`, plus Prettier with a `format:check` script; verify `pnpm lint` and `pnpm format:check` pass
- [ ] 1.4 Extend `.gitignore` with `dist/`, `coverage/`, `playwright-report/`, `test-results/`, `storybook-static/`, `.env` and `.env.*` except `.env.example`; verify `git status` stays clean after a build and a test run

## 2. Shared schema package

- [ ] 2.1 Create `packages/schema` with `exports` pointing at `src/index.ts` (no build step), exporting `healthResponseSchema` and `problemDetailSchema` with their `z.infer` types; verify with a unit test that valid and invalid examples parse as expected
- [ ] 2.2 Write ADR-0003 (Dutch, `docs/adr/0003-pnpm-workspace-en-schema-zonder-build.md`) on the workspace layout and the schema package without a build step, with building to `dist/` as the named fallback

## 3. API

- [ ] 3.1 Create `apps/api` with Fastify, `buildApp(config)` and `server.ts`; add `dev` (`tsx watch`) and `build` (esbuild bundle into one file, including `packages/schema`) scripts; verify `pnpm --filter api build` produces a runnable file and `node dist/server.js` answers the health check
- [ ] 3.2 Add the Zod config loader for `PORT`, `HOST`, `LOG_LEVEL` and `NODE_ENV`, plus `.env.example` with safe defaults and a comment per setting; verify tests `api-operations: Configuration checked at startup` › `invalid configuration stops the API` and `valid configuration starts the API` pass, and that the error output never contains the invalid value
- [ ] 3.3 Add `GET /api/health` typed from `packages/schema`; verify test `api-operations: Health check` › `health check responds` passes and parses the body with `healthResponseSchema`
- [ ] 3.4 Configure logger redaction of `authorization` and `cookie` headers; verify test `api-operations: No credentials in logs` › `authorization header is redacted` passes, using a captured log stream
- [ ] 3.5 Add not-found and error handlers that answer with `application/problem+json`; verify test `api-operations: Unknown routes return a problem detail` › `unknown path` passes

## 4. Web app frame

- [ ] 4.1 Create `apps/web` with Vite, React 19 and React Router (data mode), with the `/api` proxy to the API for `dev` and `preview`; verify `pnpm --filter web build` succeeds and `pnpm dev` serves the start page with a working proxied `/api/health`
- [ ] 4.2 Set up react-i18next with `src/i18n/nl.json` loaded synchronously, `lang="nl"` in `index.html`, and `<html lang>` set from i18next at startup; verify the app renders text from `nl.json`
- [ ] 4.3 Add `src/styles/tokens.css` (palette, spacing, type scale, radius, focus ring) using the system font stack, with the measured contrast ratios of the focus ring written next to its tokens; verify the documented ratios are at least 3:1 against the page and header backgrounds
- [ ] 4.4 Build `SkipLink` and `PageShell` (header, `main#main` with `tabIndex={-1}`, footer), with text through props only, and a placeholder start page for Evenementenloket Kranswijk that renders a React 19 `<title>`; verify the component test `page-shell: Interface text from translation files` › `text in the page frame is translated` passes with a prefixed test resource
- [ ] 4.5 Write ADR-0005 (Dutch, `docs/adr/0005-i18n-alleen-nederlands-geen-hardcoded-tekst.md`) on keeping i18n with Dutch only to prevent hard-coded text

## 5. Storybook

- [ ] 5.1 Add Storybook (`@storybook/react-vite`) to `apps/web` with `@storybook/addon-a11y` and `tokens.css` loaded globally; verify `pnpm --filter web build-storybook` succeeds
- [ ] 5.2 Add stories for `SkipLink` (normal, focused) and `PageShell`; verify the a11y addon panel shows no violations for each story
- [ ] 5.3 Write ADR-0004 (Dutch, `docs/adr/0004-storybook-in-de-app-geen-design-system-package.md`) on Storybook inside the app without a separate package

## 6. Lint rule against hard-coded text

- [ ] 6.1 Add `eslint-plugin-i18next` (`no-literal-string`, JSX mode, also checking `aria-label`, `title`, `alt` and `placeholder`) for `apps/web/src`, with stories and tests exempt; verify `pnpm lint` passes on the current code
- [ ] 6.2 Add two fixture components (literal `Opslaan`, and `t()`) and a Vitest test that runs ESLint through its Node API; verify tests `quality-gates: No hard-coded interface text` › `literal text in JSX fails lint` and `translated text passes lint` pass

## 7. Test commands and browser tests

- [ ] 7.1 Add a root Vitest config with `apps/*` and `packages/*` as projects and `e2e/` excluded, and the scripts `test` and `test:watch`; verify `pnpm test` runs all unit tests with no server running and no Playwright file included
- [ ] 7.2 Add `playwright.config.ts` (`testDir: e2e`; Chromium, Firefox and WebKit; `webServer` for the API via `tsx` and the web app via `vite preview`), the `test:e2e` script, and `e2e/support/i18n.ts` that reads `nl.json`; verify `pnpm test:e2e` starts both servers and stops them afterwards
- [ ] 7.3 Write the browser tests for `page-shell`: `skip link is the first focus stop`, `skip link moves focus to the main content`, `landmarks on the start page`, `start page heading and title`, `Dutch document language`, `automated check on the start page` (axe, WCAG 2.2 A/AA tags) and `start page at 320 pixels`; verify all pass in the three browsers

## 8. CI and repository hygiene

- [ ] 8.1 Add `.github/workflows/ci.yml` (push and pull_request: full-history checkout, gitleaks, pnpm and Node from `.nvmrc` with cache, install with frozen lockfile, lint, typecheck, `pnpm test`, build of web, api and Storybook); verify the workflow passes on the first push
- [ ] 8.2 Add `.github/workflows/e2e.yml` (`workflow_dispatch` and pull_request to `main`: same setup, cached Playwright browsers, `pnpm test:e2e`, upload of `playwright-report/` on failure); verify a manual run passes
- [ ] 8.3 Add `.github/dependabot.yml` for npm and GitHub Actions (weekly, minor and patch grouped); verify GitHub shows the config as valid under Insights › Dependency graph › Dependabot

## 9. Project docs

- [ ] 9.1 Write the Dutch `README.md` (what it is, status, how to run, test commands, CI badges, links to ADRs and user guides); verify each command in it runs as written on a fresh clone
- [ ] 9.2 Write the project `CLAUDE.md` with project-only rules (language split, OpenSpec and ADR-0001 conventions, no hard-coded text, public-repo rules, the `loket-*` skills), without repeating the global commit rules; verify it contains no secrets, hostnames or private addresses
- [ ] 9.3 Fill the `context` field in `openspec/config.yaml` with purpose, stack and hard rules (short); verify `openspec context --json` and `openspec validate --all` still succeed
- [ ] 9.4 Add `docs/handleiding/aanvrager.md` and `docs/handleiding/behandelaar.md` from the concept guides, with "Lindenwaard" replaced by "Kranswijk" and status `concept`; verify a search for "Lindenwaard" in the repo finds nothing

## 10. Integration and manual checks

- [ ] 10.1 Developer action (GitHub settings): enable secret scanning with push protection, Dependabot alerts, and branch protection on `main` that requires `ci` and `e2e`; verify a test pull request cannot be merged while a check is red
- [ ] 10.2 Manual check `quality-gates` scenarios (`unit tests run without servers`, `browser tests start what they need`, `failing unit test fails the run`, `pull request to main runs browser tests`, `push does not run browser tests`, `committed credential fails the scan`) on a throwaway branch; record the outcome per scenario in the pull request description
- [ ] 10.3 Manual check `page-shell: Visible focus` › `focus indicator is visible on every interactive element` with the keyboard in Chromium, Firefox and Safari; record the outcome in `docs/toegankelijkheidsverslag.md` (Dutch)
- [ ] 10.4 Run a sweep over the whole repo (case-insensitive) for origin-project names, private IP addresses, hostnames and home paths; verify zero hits before the first push
- [ ] 10.5 Run `/loket-ux-reviewer` on the start page; verify a report exists in `docs/ux-reviews/` and that every high-severity finding is fixed or recorded with a reason
