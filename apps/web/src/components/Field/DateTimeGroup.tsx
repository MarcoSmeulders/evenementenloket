import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldError } from "./FieldError";
import { makeFieldIds } from "./fieldUtils";
import "./Field.css";

export interface DateTimeGroupProps {
  /** Base ID; the error belongs to the group. */
  id: string;
  legend: string;
  dateLabel: string;
  timeLabel: string;
  date: { id: string; registration: UseFormRegisterReturn; isInvalid: boolean };
  time: { id: string; registration: UseFormRegisterReturn; isInvalid: boolean };
  error?: string;
  errorPrefix: string;
}

/** A date and a time as one named group, with the browser's own date and time inputs. */
export function DateTimeGroup({
  id,
  legend,
  dateLabel,
  timeLabel,
  date,
  time,
  error,
  errorPrefix,
}: DateTimeGroupProps) {
  const errorId = makeFieldIds(id).error;
  const describedBy = error ? errorId : undefined;
  return (
    <div className={error ? "field field--error" : "field"}>
      <fieldset className="field__fieldset" aria-describedby={describedBy}>
        <legend className="field__legend">{legend}</legend>
        {error && <FieldError id={errorId} message={error} prefix={errorPrefix} />}
        <div className="date-time">
          <div className="date-time__part">
            <label className="field__label" htmlFor={date.id}>
              {dateLabel}
            </label>
            <input
              {...date.registration}
              id={date.id}
              type="date"
              className="field__input field__input--short"
              aria-invalid={date.isInvalid ? true : undefined}
            />
          </div>
          <div className="date-time__part">
            <label className="field__label" htmlFor={time.id}>
              {timeLabel}
            </label>
            <input
              {...time.registration}
              id={time.id}
              type="time"
              className="field__input field__input--short"
              aria-invalid={time.isInvalid ? true : undefined}
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
}
