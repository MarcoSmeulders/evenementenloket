import nl from "../../apps/web/src/i18n/nl.json" with { type: "json" };

type Variables = Record<string, string>;

/**
 * Looks up text in the same nl.json the app uses, so tests never hard-code
 * interface text. Supports {{name}} interpolation like i18next.
 */
export function t(key: string, variables: Variables = {}): string {
  const value = key
    .split(".")
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      nl as unknown,
    );
  if (typeof value !== "string") throw new Error(`Missing translation key: ${key}`);
  return value.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => variables[name] ?? "");
}
