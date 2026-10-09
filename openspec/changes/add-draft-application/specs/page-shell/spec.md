# Spec Delta

## ADDED Requirements

### Requirement: Focus on page change
When the applicant moves to another page inside the app, focus SHALL move to that page's
level-1 heading and the page title SHALL change to the new page. When a page is loaded
directly, focus SHALL NOT be moved, so the skip link stays the first focus stop.

#### Scenario: focus moves to the heading after a page change
- **WHEN** the applicant chooses "Start melding" on the start page
- **THEN** the level-1 heading of the link page has focus and the page title names the link page

#### Scenario: direct load does not move focus
- **WHEN** a page of the flow is loaded directly by its address and the keyboard user presses Tab once
- **THEN** the skip link has focus
