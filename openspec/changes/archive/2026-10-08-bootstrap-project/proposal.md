# Proposal: bootstrap-project

## Why

The repository is empty apart from tooling config and two ADRs. Every later change
(draft application, review and submit, handler workspace) needs the same base: a
monorepo with a shared schema package, a web app with an accessible page frame, an API,
tests in two suites, and CI. Building that base first, and proving it with real tests,
means later changes only add features. It also makes the portfolio claims visible from
the first commit: accessibility in the spec, separate test suites, and CI that runs them.

## What Changes

- Set up a **pnpm workspace** with `apps/web`, `apps/api` and `packages/schema`. The schema
  package exports TypeScript source directly, with no build step.
- Add shared **tooling**: TypeScript strict (plus `noUncheckedIndexedAccess`), ESLint with
  `jsx-a11y` and a rule that rejects hard-coded interface text in JSX, Prettier,
  `.nvmrc`, `.editorconfig`.
- Create the **web app** (React 19, Vite, React Router, react-i18next with Dutch only) with
  design tokens as CSS custom properties and an accessible page frame: skip link,
  header, `main`, footer, one `h1` per page, a page title per route, `lang="nl"`. The
  first page is a placeholder start page for the Evenementenloket of the fictional
  Gemeente Kranswijk.
- Add **Storybook** inside `apps/web` with the a11y addon, with stories for the page-frame
  components.
- Create the **API** (Hono) with a health endpoint, configuration validated with Zod at
  startup, and logging that never writes authorization headers. The web app gets a typed
  client for the API (`hc`), so route and response changes show up as type errors.
- Split **tests** into `pnpm test` (Vitest, no browser) and `pnpm test:e2e` (Playwright +
  axe, starts web and API itself), as decided in ADR-0002.
- Add **CI** with GitHub Actions: `ci.yml` on every push and pull request (secret scan,
  lint, typecheck, unit tests, build) and `e2e.yml` on a manual trigger and on pull
  requests to `main`. Add a Dependabot config.
- Add **project docs**: a Dutch README, `.env.example`, a project `CLAUDE.md` with
  project-only conventions, the OpenSpec project context, the Dutch user guides (from the
  concept, renamed to Kranswijk), and ADRs for the decisions made in this change.

## Capabilities

### New Capabilities

- `page-shell`: the accessible frame every page shares — skip link, landmarks, one
  heading, page title, document language, and interface text from translation files.
- `api-operations`: how the API runs safely — health check, configuration checked at
  startup, and logs without credentials.
- `quality-gates`: the checks every change must pass — separate unit and browser test
  commands, CI workflows and when they run, the lint rule against hard-coded text, and
  the secret scan.

### Modified Capabilities

None. There are no existing specs.

## Impact

- **New code:** `apps/web`, `apps/api`, `packages/schema`, `e2e/`, `.github/`.
- **New runtime dependencies:** react, react-dom, react-router, i18next, react-i18next
  (web); hono, @hono/node-server, pino, zod (api, schema). Each is justified in `design.md`.
- **New dev dependencies:** TypeScript, Vite, Vitest, Testing Library, Playwright,
  `@axe-core/playwright`, ESLint (+ plugins), Prettier, Storybook (+ a11y addon), tsx.
- **Repository settings (manual, outside code):** secret scanning with push protection,
  Dependabot alerts, and branch protection on `main` that requires both workflows. The
  developer sets these on GitHub; `tasks.md` lists them.
- **No deployment, database or secrets** in this change. SQLite arrives with the first
  feature that stores data.
