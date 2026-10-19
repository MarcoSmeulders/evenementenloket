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

- Named functions and React components may be `function` declarations or arrow functions:
  `export function PageShell(...) { ... }` and `export const makeSummary = (event) => ...`
  are both fine. Keep one form within a file.
- Callbacks and inline handlers are arrow functions: `items.map((item) => item.id)`.

## Functional style, readable for everyone (ADR-0013)

- Business rules are pure functions: data in, data out, no side effects. They are easy to
  unit test without mocks.
- Functional core, imperative shell: API calls, storage, logging and `t()` stay at the
  edges (API route handlers, pages, layouts). The rules they use are pure functions.
- Data is immutable: `const`, `readonly` types, and spread to make a new object instead of
  changing an existing one. Do not change function parameters.
- No classes, except `Error` subclasses or where a library needs one. Use plain objects
  and functions; use a closure for private state.
- Prefer composition over inheritance.
- Keep it readable for people who do not know FP. Plain `if`, `map`, `filter` and
  `reduce` are fine. No point-free style:
  - allowed: arrow functions (`items.filter((item) => item.isActive)`) and passing a
    named function (`items.map(toTitle)`);
  - not allowed: chaining functions without a value in sight, with `pipe`, `compose`,
    `flow` or curried helpers (`pipe(filter(prop('isActive')), map(prop('title')))`).
- FP libraries (Ramda, purify-ts, ts-pattern, ...) follow the dependency rule: only when
  they add value, with the reason in the change's design or an ADR (ADR-0014).
- A small home-made monad, such as a result type `{ ok, value | error }`, is allowed when
  it has clear names, a short explanation, a unit test per helper, lives in the domain
  layer only, and every chain can be followed without FP knowledge.
