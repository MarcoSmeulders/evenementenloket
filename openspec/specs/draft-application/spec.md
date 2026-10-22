# draft-application Specification

## Purpose

Lets an organiser start a report, keep it with a personal link, fill in the organiser and
event steps over one or more visits, and check the answers before submitting.

## Requirements

### Requirement: Start a draft
The start page SHALL offer a "Start melding" button. Choosing it SHALL create a new draft
on the server and open the link page for that draft.

#### Scenario: start a report
- **WHEN** the applicant chooses "Start melding" on the start page
- **THEN** a draft is created and the page "Bewaar uw persoonlijke link" opens with the personal link of that draft

#### Scenario: API creates a draft with a one-time token
- **WHEN** a client calls `POST /api/applications`
- **THEN** the API responds 201 with an access token of 43 URL-safe characters, and `GET /api/my-application` with that token returns a draft with both steps empty

### Requirement: Token stored as a hash
The access token SHALL be generated from at least 256 random bits. The API SHALL store only
a SHA-256 hash of the token, never the token itself, and SHALL return the token only in the
response that creates the draft.

#### Scenario: database holds no token
- **WHEN** a draft is created
- **THEN** no stored value contains the access token, and the stored hash is the SHA-256 hash of the token

### Requirement: Access requires the token
Every API request for a draft SHALL carry the access token in the `Authorization` header as
a Bearer token. The API SHALL respond with a problem detail and the same body for a token
that is unknown and for a token that is malformed, so a client cannot learn whether a
draft exists.

#### Scenario: request without a token
- **WHEN** a client calls `GET /api/my-application` without an `Authorization` header
- **THEN** the API responds 401 with a problem detail

#### Scenario: unknown or malformed token
- **WHEN** a client calls `GET /api/my-application` with an unknown token, and again with a malformed token
- **THEN** both calls get status 404 and identical problem detail bodies

### Requirement: Invalid link page
Opening a link whose token does not open a draft SHALL show a page that says the link does
not work, explains what the applicant can do, and links to the start page. The page SHALL
NOT say whether a report exists.

#### Scenario: open an invalid link
- **WHEN** the applicant opens `/aanvraag/<unknown token>/organisator`
- **THEN** a page with the level-1 heading for an invalid link opens, with a link to the start page, and no form is shown

### Requirement: Personal link does not leak
Pages that contain the token in their address SHALL tell the browser not to send the
address to other sites and not to index the page.

#### Scenario: referrer and indexing are blocked
- **WHEN** any page under `/aanvraag/<token>/` is open
- **THEN** the document has referrer policy `no-referrer` and a robots rule `noindex`

### Requirement: Every token address opens the draft
Every address under `/aanvraag/<token>/` with a valid token SHALL open the matching draft,
including the address of the link page, so a bookmark of any page in the flow works.

#### Scenario: bookmark of the link page
- **WHEN** the applicant opens the saved address of the link page in a new browser session
- **THEN** the link page of that draft opens, not the invalid link page

### Requirement: Link page offers ways to keep the link
The link page SHALL show the personal link with a "Kopieer link" button, a "Mail de link
naar uzelf" link and a bookmark tip. The warning that a lost link cannot be sent again
SHALL be part of the block that shows the link, before the bookmark tip. The page SHALL
name how long a draft is kept.

#### Scenario: three ways to keep the link
- **WHEN** the link page is open
- **THEN** it shows the personal link, a "Kopieer link" button, a "Mail de link naar uzelf" link whose `mailto:` address contains the personal link, and the warning before the bookmark tip

#### Scenario: link page names the retention period
- **WHEN** the link page is open
- **THEN** it says that a draft that is not saved for 30 days is deleted

#### Scenario: copy link confirms every time
- **WHEN** the applicant chooses "Kopieer link" twice
- **THEN** the clipboard holds the personal link and the confirmation in the status region is set again after each click

#### Scenario: screen reader hears the copy confirmation
- **WHEN** a screen reader user chooses "Kopieer link"
- **THEN** the screen reader reads the confirmation that the link was copied
- **Verification:** manual

#### Scenario: link page at 320 pixels
- **WHEN** the link page is shown at 320 CSS pixels wide
- **THEN** the page has no horizontal scrollbar

#### Scenario: link page with large text on a phone
- **WHEN** the link page is shown at 360 CSS pixels wide with the text size set to 200%
- **THEN** the page has no horizontal scrollbar and the "Kopieer link" button fits inside the link block

### Requirement: Drafts are kept for 30 days without saving
A draft that has not been saved for more than 30 days SHALL be deleted. Only saving a step
SHALL restart the term; opening or reading the draft SHALL NOT. The API SHALL check for such
drafts when it starts and at least once every 24 hours. The link of a deleted draft SHALL
behave as an unknown token. Between cleanups, the API SHALL refuse an expired draft as an
unknown token, so the term is exact.

#### Scenario: draft not saved for more than 30 days is deleted
- **WHEN** the cleanup runs 30 days and one minute after a draft was last saved
- **THEN** the draft is deleted, and `GET /api/my-application` with its token responds 404 with the same body as for an unknown token

#### Scenario: draft saved within 30 days is kept
- **WHEN** a draft was created 40 days ago, saved again 10 days ago, and only opened since
- **THEN** the cleanup keeps the draft

#### Scenario: expired draft is refused before the cleanup runs
- **WHEN** a draft was last saved 30 days and one minute ago and the cleanup has not run yet
- **THEN** `GET /api/my-application` and `PUT /api/my-application/steps/organiser` with its token respond 404, with the same body as for an unknown token

### Requirement: Organiser step
Step 1 "Organisator" SHALL ask whether the applicant reports as a private person or for an
organisation, the organisation name (only for an organisation), the contact name, the
e-mail address and an optional phone number. Personal fields SHALL have an `autocomplete`
purpose.

#### Scenario: organisation name only for an organisation
- **WHEN** the applicant chooses "Namens een organisatie" and then "Particulier"
- **THEN** the field "Naam van de organisatie" appears after the first choice and disappears after the second

#### Scenario: complete organiser step
- **WHEN** an organiser step with type, contact name, a valid e-mail address and, for an organisation, an organisation name is checked as complete
- **THEN** it is accepted

#### Scenario: invalid e-mail address
- **WHEN** an organiser step with the e-mail address `sanne@` is checked
- **THEN** it is rejected with the error code for an invalid e-mail address on the e-mail field

### Requirement: Event step
Step 2 "Evenement" SHALL ask the event name, type (with a description for "other"),
location, start and end each as a date and a time, the expected number of visitors and a
description of at most 1,000 characters. Start and end SHALL each be a named group.

#### Scenario: start and end are named groups
- **WHEN** step 2 is open
- **THEN** "Begin" and "Einde" are each a group with a labelled date field and a labelled time field

#### Scenario: other type needs a description
- **WHEN** an event step with type "other" and no type description is checked as complete
- **THEN** it is rejected with the error code for a required field on the type description

#### Scenario: start in the past
- **WHEN** an event step whose start lies before the current time in Europe/Amsterdam is checked as complete
- **THEN** it is rejected with the error code for a start in the past

#### Scenario: end before start
- **WHEN** an event step whose end is not after its start is checked as complete
- **THEN** it is rejected with the error code for an end before the start

#### Scenario: description too long
- **WHEN** an event step with a description of 1,001 characters is checked
- **THEN** it is rejected with the error code for a text that is too long

### Requirement: Character counter
The description field SHALL show how many characters are left. Screen readers SHALL hear the
count after the applicant stops typing, not on every key press.

#### Scenario: remaining characters
- **WHEN** the applicant types 10 characters in the description
- **THEN** the text below the field says that 990 characters are left, and the field's accessible description includes it

#### Scenario: screen reader hears the count after a pause
- **WHEN** a screen reader user types in the description and pauses
- **THEN** the remaining number of characters is read once, not after every character
- **Verification:** manual

### Requirement: Save a complete step
"Opslaan en verder" SHALL save the step only when it is complete and valid, and then open
the next page: step 2 after step 1, the review page after step 2. The next page SHALL show
a confirmation as plain text directly after its level-1 heading.

#### Scenario: save step 1 and continue
- **WHEN** the applicant fills in step 1 completely and chooses "Opslaan en verder"
- **THEN** step 2 opens, and the first element after its heading is the confirmation that step 1 was saved

#### Scenario: save step 2 and continue
- **WHEN** the applicant fills in step 2 completely and chooses "Opslaan en verder"
- **THEN** the review page opens with the answers of step 2

#### Scenario: API rejects an incomplete step on continue
- **WHEN** a client saves a step with a missing required field and the intent to continue
- **THEN** the API responds 422 with a problem detail that lists the field and its error code, and the stored step is unchanged

### Requirement: Save a step to continue later
"Opslaan en later verdergaan" SHALL save the step when every filled-in field has a valid
format, even if required fields are still empty, and then open the link page. Its heading
and page title SHALL say which step was saved.

#### Scenario: save an incomplete step for later
- **WHEN** the applicant leaves the contact name empty, enters a valid e-mail address and chooses "Opslaan en later verdergaan"
- **THEN** the step is saved and the link page opens

#### Scenario: heading and title say the step was saved
- **WHEN** the link page opens after "Opslaan en later verdergaan" on step 1
- **THEN** its level-1 heading has focus and says that step 1 was saved, and the page title starts with the same text

#### Scenario: invalid format blocks saving for later
- **WHEN** the applicant enters the e-mail address `sanne@` and chooses "Opslaan en later verdergaan"
- **THEN** the error summary appears and nothing is saved

#### Scenario: screen reader hears that the step was saved
- **WHEN** a screen reader user chooses "Opslaan en later verdergaan" on a valid step
- **THEN** the screen reader reads that step 1 was saved
- **Verification:** manual

#### Scenario: API saves an incomplete step for later
- **WHEN** a client saves a step with empty required fields, valid formats and the intent to continue later
- **THEN** the API responds 200, the step is stored, and the draft reports that step as not complete

### Requirement: Error summary
When a step is not saved because of errors, an error summary with the heading "Er is een
probleem" SHALL appear above the form and receive focus. It SHALL list every error as a
link to its field. Each field with an error SHALL show its message and be marked invalid,
and the page title SHALL start with "Fout:".

#### Scenario: invalid step
- **WHEN** the applicant chooses "Opslaan en verder" on an empty step 1
- **THEN** the error summary with the heading "Er is een probleem" has focus, lists one link per error, and the page title starts with "Fout:"

#### Scenario: summary link moves focus to the field
- **WHEN** the applicant activates the link for the e-mail error in the error summary
- **THEN** the e-mail field has focus

#### Scenario: field error is linked to its field
- **WHEN** the e-mail field has an error
- **THEN** the field is marked invalid and its accessible description contains the error message

#### Scenario: error from the server
- **WHEN** the API rejects a step with a field error code that the browser did not find
- **THEN** the error summary and the field show the translated message for that code

### Requirement: Errors change only on submit
Error messages, the error summary and the "Fout:" title SHALL change only when the
applicant submits the step again, not while typing, when leaving a field, or when a
conditional field appears.

#### Scenario: one click submits after correcting a field
- **WHEN** the applicant corrects the e-mail field after an error and clicks "Opslaan en later verdergaan" once with the mouse
- **THEN** the step is submitted

#### Scenario: conditional field shows no error before submitting again
- **WHEN** the applicant chooses "Namens een organisatie" after a failed submit
- **THEN** the field "Naam van de organisatie" appears without an error message

#### Scenario: summary, field errors and title change together
- **WHEN** the applicant fixes one field after a failed submit and leaves it
- **THEN** the field error, the error summary and the page title stay unchanged until the next submit

### Requirement: Saving fails
When the server cannot save a step, the entered answers SHALL stay in the form and a message
that saving did not work SHALL appear above the form and receive focus.

#### Scenario: server error while saving
- **WHEN** the API responds with a server error to "Opslaan en verder"
- **THEN** the answers stay in the form and the message that saving did not work has focus

### Requirement: Resume with the link
Opening `/aanvraag/<token>` SHALL open the first step that is not complete, with saved
answers filled in, or the review page when both steps are complete. "Verder met invullen" on
the link page SHALL go to the same place. Both steps SHALL always be reachable by their
address.

#### Scenario: resume at the first incomplete step
- **WHEN** the applicant opens the link of a draft whose step 1 is complete and step 2 partly filled in
- **THEN** step 2 opens with the saved answers filled in

#### Scenario: resume a complete draft
- **WHEN** the applicant opens the link of a draft whose steps are both complete
- **THEN** the review page opens

#### Scenario: continue goes where the link goes
- **WHEN** the applicant chooses "Verder met invullen" on the link page
- **THEN** the same page opens as when opening the personal link

#### Scenario: open step 2 directly
- **WHEN** the applicant opens the address of step 2 of a draft whose step 1 is empty
- **THEN** step 2 opens

### Requirement: Read-only review page
The review page SHALL show all answers per step, without a way to change or submit them,
and SHALL say that submitting is not possible yet. When a step is not complete, opening the
review page SHALL open the first incomplete step instead.

#### Scenario: review the answers
- **WHEN** the applicant opens the review page of a complete draft
- **THEN** it shows the answers of both steps and the message that submitting is not possible yet, and it has no submit button

#### Scenario: review page with an incomplete step
- **WHEN** the applicant opens the review page of a draft whose step 1 is not complete
- **THEN** step 1 opens

### Requirement: Step position
Each step SHALL show its position in its level-1 heading ("Stap 1 van 3"). A step indicator
SHALL list the same steps as a plain list, mark the current step with `aria-current="step"`,
and SHALL NOT be a navigation landmark.

#### Scenario: heading and step indicator agree
- **WHEN** step 2 is open
- **THEN** the heading says "Stap 2 van 3", the step indicator lists three steps with the second marked current, and the page has no navigation landmark for the steps

### Requirement: Back link
Step 2 and the review page SHALL have a "Vorige stap" link above the level-1 heading that
opens the previous page. Following it SHALL NOT save the current page.

#### Scenario: back from step 2
- **WHEN** the applicant types an event name on step 2 and follows "Vorige stap"
- **THEN** step 1 opens and the typed event name is not saved

#### Scenario: back from the review page
- **WHEN** the applicant follows "Vorige stap" on the review page
- **THEN** step 2 opens

### Requirement: Keyboard and automated checks
The whole flow SHALL work with the keyboard only, and every page of the flow SHALL have no
WCAG 2.2 A or AA violations that an automated check can detect.

#### Scenario: complete the flow with the keyboard only
- **WHEN** a keyboard user starts a report, fills in both steps and reaches the review page using only the keyboard
- **THEN** every step is saved and the review page opens

#### Scenario: automated check on the draft pages
- **WHEN** an automated accessibility check runs on the link page, step 1 with errors, step 2, the review page and the invalid link page
- **THEN** it reports no violations

#### Scenario: focus indicator on the form pages
- **WHEN** a keyboard user tabs through every interactive element of the link page, step 1, step 2 and the review page
- **THEN** each element shows a visible focus indicator that is not hidden behind another element
- **Verification:** manual
