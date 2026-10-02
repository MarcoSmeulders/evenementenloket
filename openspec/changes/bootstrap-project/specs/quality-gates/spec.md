# Spec Delta

## Purpose

The checks every change must pass before it reaches `main`: fast unit tests, browser
tests, lint and type checks, and a secret scan, each run at the moment it is useful.

## ADDED Requirements

### Requirement: Separate unit and browser test commands
The repository SHALL offer one command for unit tests and a separate command for browser
tests. The unit command SHALL NOT need a browser, a running server, a database file or
network access. The browser command SHALL start the web app and the API itself.

#### Scenario: unit tests run without servers
- **WHEN** the developer runs the unit test command with no web app or API running
- **THEN** all unit tests run and no browser test is included
- **Verification:** manual

#### Scenario: browser tests start what they need
- **WHEN** the developer runs the browser test command with no web app or API running
- **THEN** the web app and the API are started, the browser tests run, and both are stopped afterwards
- **Verification:** manual

### Requirement: Fast checks on every push
Every push and every pull request SHALL run the secret scan, lint, type check, unit
tests and build. If any of them fails, the run SHALL be reported as failed.

#### Scenario: failing unit test fails the run
- **WHEN** a commit with a failing unit test is pushed
- **THEN** the fast checks are reported as failed on that commit
- **Verification:** manual

### Requirement: Browser tests on demand and before merging
Browser tests SHALL run when the developer starts them by hand and on every pull request
to `main`. A normal push SHALL NOT start them.

#### Scenario: pull request to main runs browser tests
- **WHEN** a pull request to `main` is opened or updated
- **THEN** the browser tests run, and the report is kept for download when they fail
- **Verification:** manual

#### Scenario: push does not run browser tests
- **WHEN** a commit is pushed to a branch without a pull request
- **THEN** only the fast checks run
- **Verification:** manual

### Requirement: No hard-coded interface text
Lint SHALL fail when a component contains interface text written directly in JSX
instead of coming from the translation files.

#### Scenario: literal text in JSX fails lint
- **WHEN** lint runs on a component that renders the literal text `Opslaan`
- **THEN** lint reports an error for that line

#### Scenario: translated text passes lint
- **WHEN** lint runs on a component that renders text through the translation function
- **THEN** lint reports no error for that line

### Requirement: Secrets are caught before they are shared
The secret scan SHALL fail the fast checks when the code or history contains something
that looks like a credential.

#### Scenario: committed credential fails the scan
- **WHEN** the secret scan runs on a file that contains a test API key in a known key format
- **THEN** the scan reports the finding and fails
- **Verification:** manual
