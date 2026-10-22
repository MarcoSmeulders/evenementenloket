# Design: add-draft-application

## Context

See `proposal.md` for the why. Current state after `bootstrap-project`:

- `apps/api` is a Hono app built by `buildApp(config, options)` with one chained route
  (`/api/health`), problem details via `problem()`, and request logging that redacts the
  `Authorization` header. Config is a Zod schema in `config.ts`.
- `apps/web` uses React Router in data mode with one route (`/`) under `Layout` →
  `PageShell`. Each page renders a React 19 `<title>`. Text comes from `nl.json`; lint and a
  test reject literal text.
- `packages/schema` exports Zod schemas as TypeScript source (no build step).
- Browser tests start the API (`tsx src/server.ts`, `NODE_ENV=test`) and a production build
  of the web app.

The screen behaviour comes from prototype A and its review (see proposal). The requirements
are in `specs/draft-application/spec.md` and `specs/page-shell/spec.md`.

## Goals / Non-Goals

**Goals:**

- One source for every field rule: the same Zod schemas validate in the browser and in the
  API, and the API stays the authority.
- A data model that can hold a step that is empty, partly filled in, or complete.
- Patterns that `add-review-and-submit` can extend without rework: the step schemas, the
  error-code mapping, the error summary and focus on page change.
- Stay near 900 lines of non-test TypeScript.

**Non-Goals:**

- Submitting, the reference number, status events (`add-review-and-submit`).
- "Wijzig" links on the review page with a return to the review page (`add-review-and-submit`).
- Rate limiting of draft creation, the daily reset of the demo, web server logging and
  security headers of the hosting (`add-demo-deployment`).
- Optimistic concurrency between two tabs on the same draft: last save wins.
- A no-JavaScript fallback (recorded in an ADR, see D11).

## Decisions

### D1. Step schemas: a draft and a complete variant per step

`packages/schema/src/domain/` holds per step (`organiser.ts`, `event.ts`). The API bodies
that carry them live in `packages/schema/src/api/`:

- `organiserDraftSchema` / `eventDraftSchema`: every field optional, but each field that is
  present must have a valid format (e-mail shape, max length, real date `YYYY-MM-DD`, time
  `HH:mm`, enum value). Used by "Opslaan en later verdergaan".
- `organiserSchema` / `eventSchema`: built from the draft schema with required fields and
  rules across fields (organisation name for an organisation, type description for
  "other", start in the future, end after start). Used by "Opslaan en verder" and to
  decide whether a step is complete.

Rules that depend on "now" take a clock: the event schema is created by a function
`makeEventSchema(now: Date)`, so tests pass a fixed time.

Date and time handling uses **`date-fns`** with **`@date-fns/tz`**, in one small module
`packages/schema/src/dateTimeUtils.ts` that the schemas and the web app use:

- a real date: parse `yyyy-MM-dd` strictly and check `isValid` (rejects `2027-02-30`);
- the instant of an entered date and time: a `TZDate` in `Europe/Amsterdam`, so summer and
  winter time are handled by the library, not by our own offset code;
- "start in the future" and "end after start": compare those instants (`isAfter`);
- display on the review page: `format` with the `nl` locale ("12 juni 2027, 14:00").

*Why a library:* the time-zone conversion around summer and winter time is the part that
is easy to get wrong by hand. *Alternatives:* `Intl` plus own offset code (no dependency,
about 20 lines, but the DST edge cases are ours to get right); `Temporal` (the cleanest
API, but not available by default in Node 24). The developer chose `date-fns`: well known,
tree-shakeable, and only the functions above end up in the bundle. Check the current API
of both packages with Context7 during apply.

Dates and times are stored as the strings the native inputs produce (`2027-06-12`,
`14:00`), meaning local time in Kranswijk. That avoids time-zone conversion in storage and
matches what the applicant typed.

Every issue carries a **code** as its message (`required`, `too_long`, `invalid_email`,
`invalid_phone`, `invalid_date`, `invalid_time`, `start_in_past`, `end_before_start`,
`invalid_option`), set with Zod's `error` option. The web app translates codes through
`nl.json` (`errors.<code>`, with field-specific overrides `errors.<field>.<code>` where the
text must name the field). This keeps text out of the schema package (ADR-0005).

*Alternative:* one schema with a "mode" flag. Rejected: two named schemas are easier to
read and test, and `z.infer` gives a precise type for each.

### D2. Storage: `node:sqlite`, JSON per step, behind a repository

One table:

```
applications
  id          TEXT PRIMARY KEY      -- uuid, internal only
  token_hash  TEXT NOT NULL UNIQUE  -- hex SHA-256 of the access token
  status      TEXT NOT NULL CHECK (status IN ('draft'))
  organiser   TEXT NULL             -- JSON, passed organiserDraftSchema
  event       TEXT NULL             -- JSON, passed eventDraftSchema
  created_at  TEXT NOT NULL
  updated_at  TEXT NOT NULL
```

- A step is `NULL` (empty) or JSON that passed its draft schema. Whether it is complete is
  not stored: it is derived by parsing with the complete schema. One rule, no flag that can
  drift.
- On read, each step is parsed again with its draft schema. Data that no longer fits (after
  a schema change) counts as empty. The demo is reset regularly, so no migrations.
- `ApplicationRepository` (interface) with `create`, `findByTokenHash`, `saveStep` and
  `deleteNotSavedSince`. One
  implementation on `DatabaseSync` from `node:sqlite`. The schema is created with
  `CREATE TABLE IF NOT EXISTS` at startup.
- New config setting `DATABASE_PATH` (default `data/evenementenloket.sqlite` in
  development, `:memory:` when `NODE_ENV=test`). `data/` is git-ignored. Unit tests build
  the app with an in-memory database, so `pnpm test` needs no file (quality-gates).

- **Retention.** A draft whose `updated_at` is more than 30 days ago is deleted with
  `deleteNotSavedSince(now - 30 days)`. Only saving a step updates `updated_at`; opening or
  reading the draft does not, so a link that is only looked at still expires. The API runs
  the cleanup at startup and then once every 24 hours (`setInterval` with `unref()`, so it
  never keeps the process alive). Between two cleanups, the token lookup also refuses a
  draft past the term (`isExpired`), so the 30 days is exact and not up to 24 hours late.
  The clock is injected, so tests need no waiting. A deleted or expired draft is simply not
  found, so its link gets the same 404 and invalid link page as
  an unknown token. The 30 days is one constant in `packages/schema`
  (`DRAFT_RETENTION_DAYS`), so the link page text uses the same number through i18n
  interpolation. It is not a config setting: one fixed, documented term is easier to explain
  than a setting nobody changes.

*Why `node:sqlite` over `better-sqlite3`:* no runtime dependency and no native build (also
easier in Docker later). The API is synchronous and close to `better-sqlite3`, so switching
is a change inside the repository only. Risk: the module is not marked stable yet (see
Risks). *Why JSON per step over columns:* it matches "empty, partly filled in, or complete",
keeps the Zod schema the only description of the fields, and needs no mapping. The handler
list in change 4 can read fields with `json_extract` or in TypeScript.

### D3. Token and access

- `POST /api/applications` creates a token with `crypto.randomBytes(32)` encoded as
  base64url (43 characters), stores `sha256(token)` as hex, and returns `{ accessToken }`
  once (201).
- A small middleware `requireDraft` reads `Authorization: Bearer <token>`:
  - missing or not a Bearer header → 401 problem;
  - token not 43 base64url characters, or no matching hash → 404 problem with the same body
    for both cases;
  - otherwise it puts the draft on the context.
  Comparing hashes through a unique index lookup does not leak timing about the token
  itself, so no constant-time compare is needed.
- The token never appears in an API path, so the existing log redaction is enough.
- Web: `apps/web/index.html` gets `<meta name="referrer" content="no-referrer">` for the
  whole app (simplest, and nothing in the app needs a referrer). It already had
  `<meta name="robots" content="noindex">` for the whole app since the bootstrap, which
  covers the pages under `/aanvraag/`.

### D4. API routes

Chained in `buildApp` so they reach `AppType` (ADR-0006):

| Route | Body | Response |
|---|---|---|
| `POST /api/applications` | — | 201 `{ accessToken }` |
| `GET /api/my-application` | — | 200 `{ status, steps: { organiser: { data, isComplete }, event: { data, isComplete } } }` |
| `PUT /api/my-application/steps/:step` | `{ intent: "continue" \| "later", data }` | 200 same body as GET, or 422 |

- `:step` is `organiser` or `event` (validated; anything else → 404).
- `intent: "continue"` validates with the complete schema, `"later"` with the draft schema.
  The server decides, so a client cannot store an incomplete step as complete. Status other
  than `draft` → 409 (unreachable in this change; it guards change 3).
- 422 is a problem detail with an extension member
  `errors: [{ field: "email", code: "invalid_email" }]`. `problemDetailSchema` gets an
  optional `errors` array; `problem()` accepts extensions.
- The response shape lives in `packages/schema` (`draftResponseSchema`), so web and API share
  it.

*Why `PUT` per step over `PATCH /api/my-application` (plan):* one URL per step makes the
validation choice explicit and the 422 `field` names unambiguous.

### D5. Web structure: a feature folder

This is the second part of the app next to the start page, so the idea "Mappen per
feature" (`docs/ideeen.md`) is decided now: new code goes in
`apps/web/src/features/draft/` (pages, hooks, route definitions, tests). Generic form
components (`ErrorSummary`, `TextField`, `RadioGroup`, `DateTimeGroup`, `CharacterCount`,
`BackLink`, `StepIndicator`, `LinkBox`) go in `apps/web/src/components/`, receive all text
through props, and get Storybook stories for each state (bootstrap D5).

Routes:

```
/                                start page (extended)
/aanvraag/:token                 resume: redirect to first incomplete step or review
/aanvraag/:token/link            link page (mode from navigation state)
/aanvraag/:token/organisator     step 1
/aanvraag/:token/evenement       step 2
/aanvraag/:token/controleren     review page (redirects when incomplete)
```

All `/aanvraag/:token/*` routes share a parent route whose loader fetches the draft; an
unknown token renders the invalid link page from that parent (error element), so every
child address behaves the same.

The link page has two modes. After "Opslaan en later verdergaan" the page is opened with
navigation state `{ saved: "organiser" | "event" }` and its heading and title say which step
was saved. Without that state (after "Start melding", or from a bookmark) it shows the
neutral heading "Bewaar uw persoonlijke link", whose text is true in every case.

### D6. Server state: TanStack Query with React Router loaders

*Dependency:* `@tanstack/react-query`. *Why:* chosen by the developer, as in the original
plan. It gives one cache for the draft that the loader, the steps and the review page share,
and mutation state (pending, error) for the save buttons without hand-written state.

- One `QueryClient` for the app. Query key `["draft", token]`.
- The parent route loader calls `queryClient.ensureQueryData(draftQuery(token))`, so a page
  renders with data and focus can move to its heading at once. Components read with
  `useSuspenseQuery`.
- Saving uses `useMutation`; on success it writes the response into the cache
  (`setQueryData`, the PUT returns the full draft) and navigates. No refetch needed.
- All calls go through the typed client in `apps/web/src/api/client.ts`; a small helper adds
  the Bearer header and turns a problem detail into a typed error.

*Alternative:* loaders and actions only (no Query). Not chosen by the developer; it would
save one dependency.

### D7. Forms: React Hook Form with the Zod resolver

*Dependencies:* `react-hook-form` and `@hookform/resolvers`. *Why:* well known, keeps form
state (values, errors, conditional fields) out of hand-written code, and validates with the
same Zod schemas. Check during apply that the installed resolver version supports Zod 4.

- `mode: "onSubmit"` and `reValidateMode: "onSubmit"`: errors, the summary and the title
  change only on submit (review F-02, F-03). This deviates from the plan's "re-check on
  blur".
- Two submit buttons with `name="intent"`; the submit handler reads the submitter's value
  and validates with the draft or the complete schema. Because the resolver is chosen per
  submit, the form uses a resolver that switches on the current intent.
- The error summary is built from the same `errors` object as the field messages, in field
  order, so both always agree. It gets focus after a failed submit (`setFocus` on the
  summary element via a ref and an effect on the submit count).
- A 422 from the API is applied with `setError` per field, so server-only errors look the
  same as browser errors.
- Hidden conditional fields are unregistered (`shouldUnregister` for those fields), so a
  value of a hidden field is not sent.

### D8. Error summary, status messages and focus

- `ErrorSummary` follows GOV.UK Frontend markup: a focusable container (`tabIndex={-1}`)
  with an inner `role="alert"` that holds the heading and the list (review F-07). Links use
  `href="#<fieldId>"` and move focus in a click handler, because not every browser focuses
  the target of a fragment link.
- Confirmations are not live regions that appear together with a page (review F-01):
  - after "Opslaan en later verdergaan" the confirmation is the page heading and title;
  - after "Opslaan en verder" it is a plain paragraph directly after the heading, so it is
    read right after the heading that receives focus.
- The copy confirmation uses a status region that is always present; it is cleared and set
  again on each click so a second click is announced too (review F-10).
- The "saving did not work" message uses the same pattern as the error summary (focusable,
  `role="alert"`).
- Focus on page change (page-shell): a `useFocusHeadingOnNavigate` hook in `Layout` moves
  focus to the `h1` after a navigation inside the app, using React Router's navigation
  state; it does nothing on the first load. Pages render `h1` with `tabIndex={-1}`.

### D9. Character counter

`CharacterCount` shows "U heeft nog N tekens" below the textarea, linked with
`aria-describedby`. A separate visually hidden `aria-live="polite"` region gets the same
text only after the applicant stops typing for about one second (as GOV.UK does), so
screen readers do not read every key press.

### D10. Step indicator and back link

- Heading caption "Stap N van 3" (step 1, step 2, review), with a visually hidden ": "
  so the accessible name reads naturally. The indicator is an `<ol aria-label="Stappen">`
  with `aria-current="step"`, not a `nav`, and its items are not links (review F-09).
- `BackLink` is a React Router `<Link>` with the back-link style, placed above the `h1`
  inside `main`. It links to the previous page's address, not `history.back()`. Keeping it
  inside `main` keeps `PageShell` unchanged.
- "Verder naar stap 1" and "Verder met invullen" are links styled as buttons
  (they only navigate), both to `/aanvraag/:token` (review F-11).

### D11. ADRs and docs written in this change

New ADRs (Dutch): 0009 secret link instead of login (and why a lost link cannot be
recovered); 0010 storage with `node:sqlite`, JSON per step, draft/complete schemas and the 30-day
retention;
0011 TanStack Query, React Hook Form and date-fns; 0012 no version without JavaScript, and how
accessibility is ensured. `docs/handleiding/aanvrager.md`, `docs/toegankelijkheidsverslag.md`,
`docs/roadmap.md` and `docs/ideeen.md` are updated (see tasks).

The idea "Foutafhandeling zonder throw" stays open: this change uses `safeParse` results at
the boundaries and no general result type. It is decided in `add-review-and-submit`, where
submitting adds the first domain rule with more than one outcome.

### D12. Layout at narrow widths with large text

Paddings of the link block, the error summary and buttons use `clamp()` with a viewport
part, buttons never grow wider than their container and fill the row below 30em (review
F-04). Radio labels fill their 44 px row (review F-12).

## Risks / Trade-offs

- [`node:sqlite` is not marked stable in Node 24] → All access goes through
  `ApplicationRepository`; switching to `better-sqlite3` changes one file. First task is a
  spike that runs the repository under Vitest, because Vitest must treat `node:sqlite` as a
  built-in module.
- [A partly saved step can hold data that later fails the complete schema, for example a
  start date that has passed] → Completeness is always derived with the complete schema at
  read time, so the step simply shows as not complete and the summary shows the error on the
  next "Opslaan en verder".
- [Anyone can create drafts without limit] → Acceptable for a demo; the 30-day cleanup
  keeps the table from growing forever, and rate limiting belongs to `add-demo-deployment`.
- [An applicant loses a draft after 30 days without saving] → The link page and the guide
  name the term, and every save restarts it. Recorded in ADR-0010.
- [Two new runtime dependencies for dates] → Chosen by the developer; they live only in
  `packages/schema` and are imported per function. If the bundle grows noticeably, the
  fallback is `Intl` (see D1).
- [The token is in the web address] → It stays out of API logs (header), out of `Referer`
  (`no-referrer`) and out of search engines (`noindex`). Web server logs are handled in
  `add-demo-deployment` (roadmap).
- [A lost link means a lost draft] → Copy, mail and bookmark on the link page; the warning
  sits in the link block. Recorded in ADR-0009.
- [Three new web dependencies and the size budget] → The dependencies replace hand-written
  form and cache code. If the change goes clearly over ~900 lines, stop and propose what to
  cut (for example the step indicator, which GOV.UK does not require). Outcome: the change
  came to ~2,000 lines, mostly pages and form components. The developer chose to keep the
  behaviour and raise the project budget from ~3,000 to ~4,000 lines (roadmap, "Grootte").
- [Server-side clock vs browser clock for "start in the future"] → The API is the authority;
  a mismatch shows as a server error code in the summary (scenario "error from the server").

## Migration Plan

No existing data. The API creates the table at startup. Rollback is reverting the change; the
database file in `data/` can be deleted.

## Open Questions

- Exact Dutch copy for the new pages; written in `nl.json` during apply and checked against
  the applicant guide.
