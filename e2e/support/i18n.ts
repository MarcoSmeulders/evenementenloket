import nl from "../../apps/web/src/i18n/nl.json" with { type: "json" };

type Variables = Record<string, string>;

function lookUp(key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      nl as unknown,
    );
}

/**
 * Looks up text in the same nl.json the app uses, so tests never hard-code
 * interface text. Supports {{name}} interpolation like i18next, and with a count
 * `key_one` or `key_other` (Dutch plural rules).
 */
export function t(key: string, variables: Variables = {}): string {
  const plural =
    variables.count === undefined ? undefined : variables.count === "1" ? "one" : "other";
  const value = plural ? (lookUp(`${key}_${plural}`) ?? lookUp(key)) : lookUp(key);
  if (typeof value !== "string") throw new Error(`Missing translation key: ${key}`);
  return value.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => variables[name] ?? "");
}
