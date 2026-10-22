# Proposal: add-draft-application

## Why

The loket has a page frame and an API, but an organiser cannot report anything yet. This
change adds the first real flow: start a report, keep it with a personal link, fill in the
two steps, stop and come back later. It is also the first change that stores data and has
a form, so it sets the patterns that the next changes reuse: the data model, the typed
API for a step, validation that is shared by web and API, the error summary, and focus
handling on page changes.

The screen behaviour was tried in an interactive prototype
(`docs/prototypes/persoonlijke-link-interactive.html`, proposal A chosen) and reviewed
against WCAG 2.2 AA (`docs/ux-reviews/ux-review_prototype-persoonlijke-link-a_2026-10-09.md`).
The review findings are built into the requirements of this change.

## What Changes

- **Start a report.** The start page explains what you need and has a "Start melding"
  button. It creates a draft on the server and opens the link page.
- **Personal link.** The draft is opened with a secret link
  (`/aanvraag/<token>/...`). The web app sends the token to the API as a Bearer header, and
  the database stores only a hash of it. The link page shows the link with three ways to
  keep it (copy, mail to yourself, bookmark) and a warning that a lost link cannot be sent
  again. Every URL with a valid token opens the draft, so a bookmark always works. An
  invalid link shows a page that does not reveal whether a report exists.
- **Two steps.** Step 1 "Organisator" and step 2 "Evenement", with the fields and rules from
  the applicant guide. Each step has two save buttons:
  - "Opslaan en verder" saves a complete, valid step and opens the next page;
  - "Opslaan en later verdergaan" also saves a step that is not complete yet, as long as
    what is filled in has a valid format, and then opens the link page. Its heading and
    page title say that the step was saved.
- **Error handling.** A GOV.UK-style error summary that receives focus and links to each
  field, with errors next to the fields and "Fout:" in the page title. Errors only change
  when the form is submitted, not while typing or when leaving a field.
- **Resume.** Opening the link goes to the first step that is not complete, or to the
  review page when both are. The steps can always be opened directly.
- **Read-only review page.** Shows all answers per step. Submitting is not possible yet; that
  arrives in `add-review-and-submit`. The review page sends the applicant to the first
  incomplete step when something is missing.
- **Navigation.** A "Vorige stap" back link on step 2 and on the review page. On every page
  change, focus moves to the page heading and the page title changes.
- **Storage.** SQLite through the built-in `node:sqlite` module, behind a repository
  interface. Each step is stored as JSON that has passed the step's Zod schema.
- **Retention.** A draft that has not been saved for 30 days is deleted. The link page and
  the applicant guide say so, and a link to a deleted draft shows the invalid link page.
  Drafts hold personal data, so they are not kept longer than needed.
- **Docs.** The applicant guide, the accessibility report, the roadmap and new ADRs follow
  the decisions in this change.

## Capabilities

### New Capabilities

- `draft-application`: creating a draft, the personal link and access with it, saving
  each step (partly or completely), resuming, the read-only review page, how long a draft
  is kept, and how the form reports errors and saved steps to the applicant.

### Modified Capabilities

- `page-shell`: adds focus handling on page changes. Every page change inside the app moves
  focus to the level-1 heading and updates the page title.

## Impact

- **Code:** `packages/schema` (step schemas, error codes, API bodies), `apps/api` (database,
  repository, three routes, config for the database path), `apps/web` (routes, pages,
  form components, i18n texts), `e2e/` (browser tests per scenario).
- **API:** new routes `POST /api/applications`, `GET /api/my-application` and
  `PUT /api/my-application/steps/:step`. Field errors are returned as codes in a problem
  detail (RFC 9457).
- **New runtime dependencies:** `@tanstack/react-query`, `react-hook-form` and
  `@hookform/resolvers` (web); `date-fns` and `@date-fns/tz` (schema package, so used by
  web and API). Each is justified in `design.md`. Storage and the token need no new
  dependency: `node:sqlite` and `node:crypto` are part of Node 24.
- **Configuration:** a new optional setting for the database file. Unit and browser tests
  use an in-memory database.
- **Deviations from the original plan:** `node:sqlite` instead of `better-sqlite3`; the
  reference number moves to `add-review-and-submit`; a partly filled step can be saved;
  fields are checked again only on submit, not on blur; draft retention (30 days, as the
  plan proposed) arrives here instead of in `add-demo-deployment`. `docs/roadmap.md`
  records them.
- **Size:** about 900 lines of non-test TypeScript, the biggest share of the remaining
  budget.
