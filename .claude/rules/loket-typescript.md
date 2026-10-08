---
paths:
  - "**/*.{ts,tsx}"
---

# TypeScript style

## Naming

- Booleans start with `is` or `has`: `isSubmitted`, `hasErrors`.
- Module-level constants are `ALL_CAPS`: `MAIN_ID`, `MAX_VISITORS`.
- A function that builds something from nothing starts with `create`: `createI18n()`.
- A function that builds something from an input starts with `make`: `makeSummary(event)`.
- Helpers for a module live in one file named after the subject: `eventUtils.ts`.

## Functions

- Named functions and React components are `function` declarations:
  `export function PageShell({ text }: PageShellProps) { ... }`.
- Callbacks and inline handlers are arrow functions: `items.map((item) => item.id)`.

## Functional style, without FP libraries

- Business rules are pure functions: data in, data out, no side effects. They are easy to
  unit test without mocks.
- Functional core, imperative shell: API calls, storage, logging and `t()` stay at the
  edges (API route handlers, pages, layouts). The rules they use are pure functions.
- Data is immutable: `const`, `readonly` types, and spread to make a new object instead of
  changing an existing one. Do not change function parameters.
- No classes, except `Error` subclasses or where a library needs one. Use plain objects
  and functions; use a closure for private state.
- Prefer composition over inheritance.
- Keep it readable for people who do not know FP: no point-free tricks, no home-made
  monads. Plain `if`, `map`, `filter` and `reduce` are fine.
