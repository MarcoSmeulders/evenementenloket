import type { ComponentProps } from "react";
import { FieldError } from "./FieldError";
import { makeDescribedBy, makeFieldIds } from "./fieldUtils";
import "./Field.css";

export interface TextFieldText {
  label: string;
  hint?: string;
  /** The error message, already translated; undefined when the field is fine. */
  error?: string;
  errorPrefix: string;
}

export type TextFieldProps = TextFieldText &
  Omit<ComponentProps<"input">, "id" | "aria-invalid" | "aria-describedby"> & {
    id: string;
  };

/** A labelled text input with an optional hint and error, linked for screen readers. */
export function TextField({
  id,
  label,
  hint,
  error,
  errorPrefix,
  className,
  ...input
}: TextFieldProps) {
  const ids = makeFieldIds(id);
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
      <input
        type="text"
        {...input}
        id={id}
        className={className ? `field__input ${className}` : "field__input"}
        aria-invalid={error ? true : undefined}
        aria-describedby={makeDescribedBy(id, Boolean(hint), Boolean(error))}
      />
    </div>
  );
}
