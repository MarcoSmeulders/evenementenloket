import { useEffect, useRef, useState, type ComponentProps } from "react";
import { FieldError } from "./FieldError";
import { makeDescribedBy, makeFieldIds } from "./fieldUtils";
import "./Field.css";

/** How long typing must pause before screen readers hear the count. */
const ANNOUNCE_DELAY_MS = 1000;

export type CharacterCountProps = Omit<
  ComponentProps<"textarea">,
  "id" | "aria-invalid" | "aria-describedby"
> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  errorPrefix: string;
  /** The current text, so the count follows what is typed. */
  text: string;
  maxLength: number;
  /** The count as text, for example "U heeft nog 990 tekens". Negative means too many. */
  makeCountText: (remaining: number) => string;
};

/**
 * A textarea that shows how many characters are left. The visible count is part of the
 * field's description; a separate live region repeats it only after typing pauses, so a
 * screen reader does not read it after every key press.
 */
export function CharacterCount({
  id,
  label,
  hint,
  error,
  errorPrefix,
  text,
  maxLength,
  makeCountText,
  ...textarea
}: CharacterCountProps) {
  const ids = makeFieldIds(id);
  const countId = `${id}-count`;
  const remaining = maxLength - text.length;
  const countText = makeCountText(remaining);
  const [announcement, setAnnouncement] = useState("");
  const initialCountText = useRef(countText);

  useEffect(() => {
    // Only a change is announced, not the count when the page opens.
    if (countText === initialCountText.current && announcement === "") return;
    const timer = setTimeout(() => setAnnouncement(countText), ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [countText, announcement]);

  return (
    <div className={error ? "field field--error" : "field"}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {hint && (
        <span className="field__hint" id={ids.hint}>
          {hint}
        </span>
      )}
      {error && <FieldError id={ids.error} message={error} prefix={errorPrefix} />}
      <textarea
        {...textarea}
        id={id}
        className="field__input field__input--textarea"
        aria-invalid={error ? true : undefined}
        aria-describedby={makeDescribedBy(id, Boolean(hint), Boolean(error), countId)}
      />
      <span
        id={countId}
        className={remaining < 0 ? "character-count character-count--over" : "character-count"}
      >
        {countText}
      </span>
      <span className="visually-hidden" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
