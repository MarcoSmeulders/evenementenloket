import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldError } from "./FieldError";
import { makeDescribedBy, makeFieldIds } from "./fieldUtils";
import "./Field.css";

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  name: string;
  legend: string;
  options: readonly RadioOption[];
  registration: UseFormRegisterReturn;
  hint?: string;
  error?: string;
  errorPrefix: string;
  /** Extra question shown below one option while that option is chosen. */
  conditional?: { value: string; isShown: boolean; content: ReactNode };
}

/** The ID of the first radio: the target for a link in the error summary. */
export function makeRadioId(name: string, value: string) {
  return `${name}-${value}`;
}

/** A group of radios in a fieldset, with the legend as the question. */
export function RadioGroup({
  name,
  legend,
  options,
  registration,
  hint,
  error,
  errorPrefix,
  conditional,
}: RadioGroupProps) {
  const ids = makeFieldIds(name);
  return (
    <div className={error ? "field field--error" : "field"}>
      <fieldset
        className="field__fieldset"
        aria-describedby={makeDescribedBy(name, Boolean(hint), Boolean(error))}
      >
        <legend className="field__legend">{legend}</legend>
        {hint && (
          <span className="field__hint" id={ids.hint}>
            {hint}
          </span>
        )}
        {error && <FieldError id={ids.error} message={error} prefix={errorPrefix} />}
        {options.map((option) => (
          <div key={option.value}>
            <div className="radio">
              <input
                {...registration}
                className="radio__input"
                type="radio"
                id={makeRadioId(name, option.value)}
                value={option.value}
              />
              <label className="radio__label" htmlFor={makeRadioId(name, option.value)}>
                {option.label}
              </label>
            </div>
            {conditional?.value === option.value && conditional.isShown && (
              <div className="radio__conditional">{conditional.content}</div>
            )}
          </div>
        ))}
      </fieldset>
    </div>
  );
}
