---
paths:
  - "packages/schema/**/*.ts"
---

# Zod schemas

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
