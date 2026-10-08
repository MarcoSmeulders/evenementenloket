# Evenementenloket Kranswijk — project rules

A portfolio project: organisers report a small event to the fictional Gemeente Kranswijk,
save a draft, submit it and follow its status; a case handler reviews it. The repository
is public and is read by reviewers. See `README.md` for the overview.

## Language

- **Dutch:** all reports and documentation — ADRs (`docs/adr/`), UX reviews
  (`docs/ux-reviews/`), the accessibility report, user guides (`docs/handleiding/`) and
  the README. Interface text is Dutch, in `apps/web/src/i18n/nl.json`.
- **English:** code, identifiers, inline comments, commit messages and OpenSpec artifacts
  (proposal, design, specs, tasks).
- Write simply: short sentences, plain words, practical.

## Working with OpenSpec

- Behaviour changes go through OpenSpec: proposal → review by the developer → implement →
  archive. One change at a time. Tooling, config and doc-only changes skip OpenSpec
  (ADR-0001).
- **One scenario, one test (ADR-0001).** Each `#### Scenario:` has exactly one test whose
  title is the scenario title, inside `describe('<capability>: <requirement>')`.
  Scenarios that cannot be automated carry `- **Verification:** manual` and are recorded
  in `docs/toegankelijkheidsverslag.md` or the pull request.
- Write the test from the reviewed scenario, not from the implementation.
- Archive only when tasks are done, CI is green, every scenario is proven or checked by
  hand, and the user guides match the screens.

## Code rules

- No interface text in code. Text lives in `nl.json`; reusable components get text via
  props, only pages and layouts call `t()` (ADR-0005). Lint enforces it.
- Shared rules and types live in `packages/schema` as Zod schemas; types come from
  `z.infer`, never hand-written (ADR-0003).
- Tests find elements by role and accessible name, never by CSS class or test ID.
- Unit tests (`pnpm test`) need no browser, server or network. Browser tests live in
  `e2e/` and run with `pnpm test:e2e` (ADR-0002).
- No Redux and no functional-programming libraries (Ramda, purify-ts, ts-pattern).
- Every new runtime dependency needs a short justification in the change's design or an
  ADR.
- API errors use problem details (RFC 9457); field errors are codes, not text.
- The web app calls the API only through the typed client in `apps/web/src/api/client.ts`.
  API routes stay chained so their types reach `AppType` (ADR-0006).
- Style rules per file type live in `.claude/rules/loket-*.md` (naming, functions,
  functional style, Zod schemas). They load when you work on matching files.

## Working habits

- After changing code, run `pnpm lint && pnpm typecheck && pnpm test` and fix what fails
  before reporting the work as done.
- Look up current library docs with Context7 instead of relying on memory.

## Public repository

- Never write secrets, real personal data, real hostnames, private IP addresses, server
  paths or usernames into any file, test, seed data or screenshot.
- Test data uses fictional names and `example.org` / `example.com` addresses.
- Only `.env.example` files are committed. Never read `.env` files.
- Never reference other client or employer projects, by name or by detail.
- Only the project's own `loket-*` files in `.claude/` are committed (see `.gitignore`).
  They must stay free of personal data, home paths, hostnames and references to the
  developer's own machines or servers.

## Project skills

- `/loket-quick-commit` — commit with the public-repo checks.
- `/loket-ux-reviewer` — UX and accessibility review; reports go to `docs/ux-reviews/`.

## Commands

```sh
pnpm dev          # API on :3001 and web on :5173
pnpm test         # unit tests
pnpm test:e2e     # browser tests (starts API and web itself)
pnpm test:e2e:local  # same, without WebKit (WebKit does not start on Ubuntu 26.04)
pnpm lint && pnpm typecheck && pnpm format:check
pnpm storybook
```
