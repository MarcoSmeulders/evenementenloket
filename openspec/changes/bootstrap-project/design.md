# Design: bootstrap-project

## Context

The repo has only tooling config (`.claude/`, `openspec/`) and ADR-0001 and ADR-0002. See
proposal.md for why this change comes first. Fixed points from earlier decisions:

- Backend is part of v1. Shared types live in `packages/schema`.
- Storybook lives inside `apps/web`. There is no separate design-system package.
- Dutch only, with i18n kept so no text is hard-coded.
- Trede 2, licht (ADR-0001): every scenario gets one test with the same title, or is
  marked manual.
- Unit and browser tests are separate, with two CI workflows (ADR-0002).
- Reports and docs are in Dutch. Code, comments, commits and OpenSpec artifacts are in
  English.
- The repo will be public: no secrets, real personal data or infrastructure details.

## Goals / Non-Goals

**Goals:**
- A base that later changes extend without restructuring.
- Every scenario in this change's specs is proven by a test or a recorded manual check.
- `pnpm install && pnpm test` works on a fresh clone with nothing else running.

**Non-Goals:**
- Database, data model, or any form. Those start in `add-draft-application`.
- Docker and deployment (`add-demo-deployment`).
- Focus handling on route change. There is only one route now. It arrives with the step
  flow in `add-draft-application`.
- A second language.

## Decisions

### D1. Workspace layout, and a schema package without a build step

```
apps/web         React app + Storybook
apps/api         Hono API
packages/schema  Zod schemas and types, shared by web and api
e2e/             Playwright tests
```

`packages/schema` points `exports` at `./src/index.ts`. Vite, Vitest and `tsx` read
TypeScript directly, so there is no build or watch step for the package.

- **Why:** one less build step, and no `dist/` getting out of sync. Changes to the schema
  are visible in web and API immediately.
- **Alternative:** build the package to `dist/` (ESM + types). That gives more moving
  parts for no gain while there is only one repo using it.
- **Consequence:** the API production build bundles its code, including the schema, into
  one JS file with esbuild (already installed through Vite). Node never has to load `.ts`
  from `node_modules`.

### D2. Web app: React 19, Vite, React Router

- Routing with React Router in data mode (`createBrowserRouter`). There is one route now
  (`/`, start page). Later changes add step URLs.
- **Page title:** each page renders a React 19 `<title>` element, which React moves into
  `<head>`. That needs no extra library or hook. The format is
  `<page name> - Evenementenloket Kranswijk`, both parts from `nl.json`.
- **Page frame:** a `PageShell` component renders the skip link, `header`, `main`
  (`id="main"`, `tabIndex={-1}` so the skip link can move focus to it) and `footer`.
- TanStack Query and React Hook Form are **not** installed yet. They arrive with the
  first feature that needs them, with their justification in that change.

### D3. Interface text: react-i18next, Dutch only, lint enforcement

- `apps/web/src/i18n/nl.json` holds all text. It is loaded synchronously at startup (no
  network request, no flash of keys).
- `<html lang>` is set from the active i18next language at startup, and `index.html`
  starts with `lang="nl"` so the right value is there before JavaScript runs.
- Components get their text through props, or through `t()` in page-level components.
  Reusable components never call `t()` themselves. This keeps them usable in Storybook
  with any text.
- **Lint:** `eslint-plugin-i18next` with `no-literal-string` in JSX mode. It also checks
  the attributes `aria-label`, `title`, `alt` and `placeholder`. Stories and tests are
  exempt.
- **Test for "text in the page frame is translated":** a Vitest component test renders
  the frame with a test resource in which every value is prefixed (for example
  `[x] ...`). Every visible and accessible text must carry that prefix. This catches text
  that skipped the translation files at runtime, not only in lint.
- **Alternative:** no i18n, with constants in one file. That is simpler, but gives no
  lint rule and no structure for error codes later. See ADR-0005.

### D4. Styling: design tokens and plain CSS

- `apps/web/src/styles/tokens.css` defines colours, spacing, type scale, radius and the
  focus ring as CSS custom properties. The palette is new and fits a municipality (calm
  blue-green), and is not taken from any existing brand.
- One CSS file per component, imported by that component. Class names are prefixed per
  component (`page-shell__header`). No CSS framework and no CSS-in-JS.
- **Focus ring:** a 3px outline plus offset, in a colour with at least 3:1 contrast
  against both the page background and the header background. The contrast values are
  written next to the tokens.
- **Font:** the system font stack. No web fonts, so there are no external requests and
  no layout shift.

### D5. Storybook inside `apps/web`

- `@storybook/react-vite` with `@storybook/addon-a11y`. Stories sit next to the
  component (`SkipLink.stories.tsx`).
- Stories exist for `SkipLink` (normal and focused) and `PageShell`. Later changes add
  stories for each form component and each of its states.
- CI builds Storybook in the fast job, so a broken story fails the run. Storybook is not
  deployed in this change.
- **Why not a package:** see ADR-0004 (one user of the components, so no package yet).

### D6. API: Hono, with a typed client for the web app

- **Why Hono:** its typed client (`hc`) lets the web app call the API with the routes,
  inputs and responses known at compile time. If a route or response changes, the web app
  fails to typecheck. See ADR-0006 for the comparison with Fastify.
- `buildApp(config)` creates the app without starting it. Unit tests call
  `app.request()`, so no server or port is needed. `server.ts` starts it with
  `@hono/node-server`.
- **Routes are chained** (`app.get(...).get(...)`) and the result is exported as
  `AppType`. The typed client needs that type.
- **Config:** a Zod schema reads `process.env` (`PORT`, `HOST`, `LOG_LEVEL`,
  `NODE_ENV`). On failure, it prints which setting is wrong, never its value, and exits
  with code 1. `.env.example` lists every setting with a safe default and a comment.
- **Logging:** pino, added as a dependency because Hono has no structured logger. A small
  middleware logs one line per request: method, path, status, duration and the request
  headers. `redact` replaces `authorization` and `cookie`. A test captures log output in a
  stream and checks that the values are missing.
- **Errors:** `notFound` and `onError` both answer with `application/problem+json`
  (`type`, `title`, `status`, optional `detail`). The problem-detail type is defined in
  `packages/schema` so the web app can use it.
- **Health:** `GET /api/health` returns `{ status: "ok" }`, typed as `z.infer` of the
  schema in `packages/schema`. One test calls it through the typed client
  (`hono/testing`), so the type chain from route to client is tested too.
- **Typed client in the web app:** `apps/web/src/api/client.ts` creates `hc<AppType>('/')`.
  The web app imports only the *type* from `@evenementenloket/api` (`import type`), so no
  API code ends up in the browser bundle. The first feature that calls the API uses this
  client. Runtime checks of responses still use the Zod schemas where it matters.
- No validator middleware yet. `@hono/zod-validator` arrives with the first route that
  takes input.

### D7. Running web and API together

- **Development:** the Vite dev server proxies `/api` to the API. The browser sees one
  origin, so there is no CORS to configure. `pnpm dev` starts both.
- **Browser tests:** Playwright's `webServer` starts the API (`tsx`) and the built web app
  (`vite preview`, with the same proxy). Tests run against a production build, which is
  closer to what users get.
- Fixed local ports: web 5173, API 3001. Both can be overridden with environment
  variables.

### D8. Test setup

- **Vitest** with a root config that lists `apps/*` and `packages/*` as projects. Web
  component tests use jsdom and Testing Library. `e2e/` is excluded.
- **Playwright:** `testDir: e2e`, projects for Chromium, Firefox and WebKit. A helper
  `e2e/support/i18n.ts` reads the same `nl.json`, so tests never hard-code text.
- Test names follow ADR-0001: `describe('<capability>: <requirement>')` and
  `test('<scenario title>')`.
- **Scenarios that are manual** (the `Verification: manual` scenarios in
  `quality-gates` and visible focus in `page-shell`) are checked once when this change is
  done. The result goes in `docs/toegankelijkheidsverslag.md` (focus) or in the pull
  request description (CI behaviour).
- **Lint scenarios** are proven by a Vitest test that runs ESLint through its Node API
  on two small fixture components, one with literal text and one with `t()`.

### D9. CI: GitHub Actions

- `ci.yml` (push, pull_request): checkout with full history → gitleaks → pnpm + Node from
  `.nvmrc` with pnpm cache → `pnpm install --frozen-lockfile` → lint → typecheck →
  `pnpm test` → build (web, api, Storybook).
- `e2e.yml` (`workflow_dispatch`, pull_request to `main`): same setup → cache Playwright
  browsers by version → `playwright install --with-deps` → `pnpm test:e2e` → upload
  `playwright-report/` when it fails.
- **Secret scan:** the official gitleaks container image (pinned version), run directly
  in the workflow. It scans the full history on every push, because anything ever
  committed is public. The `gitleaks-action` was tried first: it only scans the pushed
  commits and failed on the first push of the repository, which has no parent commit.
- **Dependabot:** `.github/dependabot.yml` for npm and GitHub Actions, weekly, with
  grouped minor and patch updates to keep the noise down.
- Actions are pinned to a major version (`@v4`). Pinning to a commit SHA is more secure
  but harder to read. Dependabot keeps the versions current.

### D10. Project docs

- **README (Dutch):** what it is, the status, how to run it, test commands, CI badges,
  and links to ADRs. Screenshots and a demo link come later.
- **`CLAUDE.md` (project):** only project-specific rules: the language split, OpenSpec and
  ADR-0001 conventions, no hard-coded text, rules for a public repo, and the `loket-*`
  skills. The global rules on commits and attribution are not repeated.
- **`openspec/config.yaml`:** a short `context` with the project's purpose, stack and
  hard rules from the concept plan, so later proposals get them automatically.
- **User guides:** `docs/handleiding/aanvrager.md` and `docs/handleiding/behandelaar.md`,
  taken from the concept with "Lindenwaard" replaced by "Kranswijk", marked as concept.
  They act as a UX description for later changes. Each later change that alters a screen
  updates them.
- **New ADRs (Dutch):** 0003 pnpm workspace and schema package without a build step;
  0004 Storybook in the app, no design-system package; 0005 i18n with Dutch only and no
  hard-coded text.

## Risks / Trade-offs

- [`eslint-plugin-i18next` flags strings that are not interface text, such as a `type`
  value or a test ID] → JSX-only mode plus a short allow-list of attributes. Any
  `eslint-disable` needs a comment that explains why.
- [The schema package exported as `.ts` breaks a tool that expects JS] → the API is
  bundled for production, and Vite and Vitest support `.ts` directly. If a tool still
  breaks, ADR-0003 names building to `dist/` as the fallback.
- [Storybook major versions change often, and Dependabot PRs may break stories] → CI
  builds Storybook, so a breaking update fails its PR instead of reaching `main`.
- [Three browser engines make the e2e run slower] → only a few tests exist now. If the
  run takes too long later, WebKit can move to the pull-request run only.
- [gitleaks false positives on test fixtures] → a `.gitleaks.toml` allow-list for
  specific paths, only when a real false positive occurs.
- [The manual scenarios depend on discipline] → they are listed as explicit tasks, and
  the change is not archived until they are done (ADR-0001, rule 7).

## Migration Plan

Not applicable. This is the first code in the repository. Rollback means reverting the
merge commit of this change.
