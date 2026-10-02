# Spec Delta

## Purpose

The accessible frame that every page of the web app shares, so that keyboard and
screen reader users can find their way the same way on every page.

## ADDED Requirements

### Requirement: Skip link
Every page SHALL start with a skip link to the main content. It SHALL be the first
element that receives keyboard focus, and it SHALL be visible while it has focus.

#### Scenario: skip link is the first focus stop
- **WHEN** a keyboard user loads a page and presses Tab once
- **THEN** the skip link has focus and is visible

#### Scenario: skip link moves focus to the main content
- **WHEN** the user activates the focused skip link
- **THEN** focus moves to the `main` landmark

### Requirement: Page landmarks
Every page SHALL have exactly one `banner`, one `main` and one `contentinfo` landmark.

#### Scenario: landmarks on the start page
- **WHEN** the start page is rendered
- **THEN** it has exactly one banner, one main and one contentinfo landmark

### Requirement: One heading and a unique title per page
Every page SHALL have exactly one level-1 heading and a page title that describes that
page and ends with the product name.

#### Scenario: start page heading and title
- **WHEN** the start page is rendered
- **THEN** it has exactly one level-1 heading
- **AND** the page title is the page name followed by the product name

### Requirement: Document language
The document language SHALL match the language of the interface text. In this version
that is Dutch.

#### Scenario: Dutch document language
- **WHEN** any page is rendered
- **THEN** the `html` element has `lang="nl"`

### Requirement: Interface text from translation files
All visible and accessible interface text SHALL come from the translation files, so
that copy lives in one place and can be changed without code changes.

#### Scenario: text in the page frame is translated
- **WHEN** the page frame is rendered with a test translation in which every value differs from the Dutch text
- **THEN** the skip link, header, footer and start page show only text from that test translation

### Requirement: No automatically detectable accessibility errors
Every page SHALL have no WCAG 2.2 A or AA violations that an automated accessibility
check can detect. This is a safety net, not proof of accessibility.

#### Scenario: automated check on the start page
- **WHEN** an automated accessibility check runs on the start page in a real browser
- **THEN** it reports no violations

### Requirement: Visible focus
Every focusable element SHALL show a focus indicator with a contrast of at least 3:1
against the adjacent colours, and no fixed element SHALL cover the focused element.

#### Scenario: focus indicator is visible on every interactive element
- **WHEN** a keyboard user tabs through every interactive element of the start page
- **THEN** each element shows a visible focus indicator that is not hidden behind another element
- **Verification:** manual

### Requirement: Content reflows at narrow widths
Pages SHALL be usable at a width of 320 CSS pixels and at 400% zoom without scrolling in
two directions.

#### Scenario: start page at 320 pixels
- **WHEN** the start page is shown at 320 CSS pixels wide
- **THEN** the page has no horizontal scrollbar
