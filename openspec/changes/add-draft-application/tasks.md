# Tasks

Test titles below are the scenario titles; each test sits in
`describe('<capability>: <requirement>')` (ADR-0001). Unit tests (`*.test.ts`) need no
browser, server or database file; browser tests live in `e2e/`.

## 1. Spike and dependencies

- [ ] 1.1 Spike: open a `DatabaseSync(':memory:')` from `node:sqlite` inside a Vitest test in `apps/api` and run a `json_extract` query; verify the test passes with `pnpm test` (if Vitest cannot load `node:sqlite`, stop and report before continuing)
- [ ] 1.2 Add `@tanstack/react-query`, `react-hook-form` and `@hookform/resolvers` to `apps/web` (check with Context7 that the resolver supports Zod 4); verify `pnpm install`, `pnpm typecheck` and `pnpm run audit` pass

## 2. Shared step schemas and API bodies

- [ ] 2.1 Add the error codes and the organiser schemas (`organiserDraftSchema`, `organiserSchema`) in `packages/schema/src/application/`, with codes as issue messages; verify tests `draft-application: Organiser step` › `complete organiser step` and `invalid e-mail address` pass
- [ ] 2.2 Add the event schemas (`eventDraftSchema`, `eventSchemaAt(now)`) with Europe/Amsterdam comparison for "start in the future"; verify tests `draft-application: Event step` › `other type needs a description`, `start in the past`, `end before start` and `description too long` pass, including a case around a daylight-saving change
- [ ] 2.3 Add the request and response schemas (`saveStepRequestSchema` with `intent`, `draftResponseSchema`, `createDraftResponseSchema`) and an optional `errors` array of `{ field, code }` on `problemDetailSchema`; verify unit tests for valid and invalid examples pass

## 3. API: storage, token and routes

- [ ] 3.1 Add `DATABASE_PATH` to the config (default `data/evenementenloket.sqlite`, `:memory:` when `NODE_ENV=test`), to `.env.example` with a comment, and `data/` to `.gitignore`; verify the existing config tests still pass and `git status` stays clean after `pnpm dev`
- [ ] 3.2 Add `ApplicationRepository` on `node:sqlite` (table from design D2, steps re-parsed with the draft schema on read) and inject it into `buildApp`; verify repository unit tests for create, find by hash and save step pass on `:memory:`
- [ ] 3.3 Add `POST /api/applications` (token from 32 random bytes, base64url, stored as SHA-256 hex); verify tests `draft-application: Start a draft` › `API creates a draft with a one-time token` and `draft-application: Token stored as a hash` › `database holds no token` pass
- [ ] 3.4 Add the `requireDraft` middleware and `GET /api/my-application` with derived `complete` per step; verify tests `draft-application: Access requires the token` › `request without a token` and `unknown or malformed token` pass
- [ ] 3.5 Add `PUT /api/my-application/steps/:step` with `intent` choosing the draft or complete schema, 422 with `errors` codes, 409 for a non-draft status; extend `problem()` with extension members; verify tests `draft-application: Save a complete step` › `API rejects an incomplete step on continue` and `draft-application: Save a step to continue later` › `API saves an incomplete step for later` pass, and the routes stay chained in `AppType` (web typecheck fails when the response type changes)
- [ ] 3.6 Write ADR-0009 (Dutch, geheime link in plaats van inloggen) and ADR-0010 (Dutch, opslag met `node:sqlite`, JSON per stap en draft/complete-schema's); verify both are linked from `docs/adr/README.md`

## 4. Web foundations

- [ ] 4.1 Move to a feature folder `apps/web/src/features/draft/`, add one `QueryClient`, the API helper (Bearer header, problem detail to typed error) and the `/aanvraag/:token` parent route whose loader calls `ensureQueryData`; mark the idea "Mappen per feature" as decided in `docs/ideeen.md`; verify `pnpm typecheck` and `pnpm test` pass
- [ ] 4.2 Add the invalid link page as the parent route's error element, `<meta name="referrer" content="no-referrer">` in `index.html`, and `noindex` on all `/aanvraag/` pages; verify tests `draft-application: Invalid link page` › `open an invalid link` and `draft-application: Personal link does not leak` › `referrer and indexing are blocked` pass
- [ ] 4.3 Add focus on page change in `Layout` (to the `h1` after an in-app navigation, nothing on first load); verify tests `page-shell: Focus on page change` › `focus moves to the heading after a page change` and `direct load does not move focus` pass, and the existing page-shell tests still pass

## 5. Form components with stories

- [ ] 5.1 Build `ErrorSummary` (GOV.UK markup with inner `role="alert"`, links that move focus) and `TextField` / `RadioGroup` with hint, error, `aria-invalid` and `aria-describedby`, text via props only; add stories for empty, hint and error states; verify the Storybook a11y panel shows no violations and `pnpm --filter @evenementenloket/web build-storybook` succeeds
- [ ] 5.2 Build `DateTimeGroup` (fieldset with native date and time inputs), `CharacterCount` (visible count plus a delayed live region), `StepIndicator` (plain `ol`, `aria-current="step"`), `BackLink`, `LinkBox` and a link styled as a button; add stories per state; verify as in 5.1, and that radio labels fill their 44 px row
- [ ] 5.3 Add the narrow-screen rules (`clamp()` paddings, buttons never wider than their container, full width below 30em) to the shared styles; verify in Storybook at 320 px with 200% text that no component overflows

## 6. Start page and link page

- [ ] 6.1 Extend the start page (what you need, "Start melding") and build the link page (neutral and "saved" mode from navigation state, link block with warning, copy, mailto, bookmark tip, "Verder" links to `/aanvraag/:token`); add all text to `nl.json`; verify tests `draft-application: Start a draft` › `start a report`, `draft-application: Link page offers ways to keep the link` › `three ways to keep the link`, `copy link confirms every time`, `link page at 320 pixels`, `link page with large text on a phone`, and `draft-application: Every token address opens the draft` › `bookmark of the link page` pass
- [ ] 6.2 Update sections 2 and 3 of `docs/handleiding/aanvrager.md` (start, link page, mail button) so labels match `nl.json`; verify every button and link label in those sections appears in `nl.json`

## 7. Step 1 and form behaviour

- [ ] 7.1 Build step 1 with React Hook Form (`mode` and `reValidateMode` `onSubmit`, resolver chosen by intent, two submit buttons, hidden conditional field unregistered); verify tests `draft-application: Organiser step` › `organisation name only for an organisation` and `draft-application: Save a step to continue later` › `save an incomplete step for later`, `heading and title say the step was saved`, `invalid format blocks saving for later` pass
- [ ] 7.2 Wire the error summary (field order, focus after a failed submit, "Fout:" title) and apply 422 codes with `setError`; verify tests `draft-application: Error summary` › `invalid step`, `summary link moves focus to the field`, `field error is linked to its field`, `error from the server` (API mocked with `page.route`) pass
- [ ] 7.3 Verify the error timing with tests `draft-application: Errors change only on submit` › `one click submits after correcting a field` (real mouse click), `conditional field shows no error before submitting again` and `summary, field errors and title change together`
- [ ] 7.4 Add the "saving did not work" message; verify test `draft-application: Saving fails` › `server error while saving` passes (API mocked to respond 500)
- [ ] 7.5 Write ADR-0011 (Dutch, TanStack Query en React Hook Form) and update section 4 "Stap 1", "Opslaan", "Als er iets niet klopt" and "Stoppen en later verdergaan" in `docs/handleiding/aanvrager.md` (partial save, errors only on submit); verify labels match `nl.json`

## 8. Step 2

- [ ] 8.1 Build step 2 (event fields, `DateTimeGroup` for start and end, visitor groups, description with `CharacterCount`, "other" description as conditional field); verify tests `draft-application: Event step` › `start and end are named groups`, `draft-application: Character counter` › `remaining characters` and `draft-application: Save a complete step` › `save step 1 and continue` pass
- [ ] 8.2 Update section 4 "Stap 2" of `docs/handleiding/aanvrager.md` (date and time fields, counter); verify labels match `nl.json`

## 9. Resume, review page and navigation

- [ ] 9.1 Add the resume route (first incomplete step or review page) and free access to both steps; verify tests `draft-application: Resume with the link` › `resume at the first incomplete step`, `resume a complete draft`, `continue goes where the link goes` and `open step 2 directly` pass
- [ ] 9.2 Build the read-only review page with its guard and the "submitting is not possible yet" message; verify tests `draft-application: Read-only review page` › `review the answers`, `review page with an incomplete step` and `draft-application: Save a complete step` › `save step 2 and continue` pass
- [ ] 9.3 Add the heading caption "Stap N van 3", the step indicator and the "Vorige stap" links; verify tests `draft-application: Step position` › `heading and step indicator agree` and `draft-application: Back link` › `back from step 2` and `back from the review page` pass
- [ ] 9.4 Update section 5 of `docs/handleiding/aanvrager.md` for the read-only review page in this version, and the "Vorige stap" link; verify labels match `nl.json`

## 10. Integration and manual checks

- [ ] 10.1 Add the keyboard and axe tests; verify `draft-application: Keyboard and automated checks` › `complete the flow with the keyboard only` and `automated check on the draft pages` pass in Chromium and Firefox (`pnpm test:e2e:local`), and in all three browsers in CI
- [ ] 10.2 Do the manual scenarios (copy confirmation, saved step and character count with NVDA + Firefox and VoiceOver + Safari; focus indicator on the form pages) and record the results in `docs/toegankelijkheidsverslag.md` under this change
- [ ] 10.3 Write ADR-0012 (Dutch, geen versie zonder JavaScript en hoe de toegankelijkheid toch goed blijft); verify it is linked from `docs/adr/README.md`
- [ ] 10.4 Run `pnpm lint && pnpm typecheck && pnpm test && pnpm format:check && pnpm run audit` and count the non-test TypeScript lines added; verify all pass and report the line count against the ~900 estimate
- [ ] 10.5 Check that every scenario in this change has exactly one test with its title, or a manual record; verify with a grep of the scenario titles against `e2e/` and `*.test.ts(x)`
