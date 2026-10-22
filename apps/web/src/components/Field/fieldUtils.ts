/** IDs of the hint and error that belong to a field, so labels and errors stay linked. */
export function makeFieldIds(id: string) {
  return { hint: `${id}-hint`, error: `${id}-error` };
}

/** The `aria-describedby` value for a field: its hint first, then its error. */
export function makeDescribedBy(id: string, hasHint: boolean, hasError: boolean, extra?: string) {
  const ids = makeFieldIds(id);
  const parts = [hasHint ? ids.hint : "", hasError ? ids.error : "", extra ?? ""].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : undefined;
}
