---
paths:
  - "packages/schema/**/*.ts"
---

# Zod schemas

- `packages/schema/src` has two folders:
  - `api/`: what crosses the wire between web and API: request and response bodies, the
    token, field errors and problem details.
  - `domain/`: what a valid report is: the data and rules per subject (organiser, event),
    used by the web form and by the API alike.

  `api/` may import from `domain/`, not the other way round (test helpers excepted).
  Plain helpers shared by both, without schemas, sit at the root: `dateTimeUtils.ts`.
- A schema is named after its subject with a `Schema` suffix, in camelCase. Its type has
  the same name in PascalCase, inferred from the schema:

  ```ts
  export const eventReportSchema = z.object({ ... });
  export type EventReport = z.infer<typeof eventReportSchema>;
  ```

- IDs are branded, so one kind of ID cannot be passed where another is expected:

  ```ts
  export const eventIdSchema = z.uuid().brand<"EventId">();
  export type EventId = z.infer<typeof eventIdSchema>;
  ```

  A plain `string` is not an `EventId`; it becomes one only by parsing it with the schema.
