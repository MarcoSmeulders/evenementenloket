import type { MouseEvent, Ref } from "react";
import "./ErrorSummary.css";

export interface ErrorSummaryItem {
  /** ID of the field (or first radio) the link moves focus to. */
  targetId: string;
  message: string;
}

export interface ErrorSummaryProps {
  title: string;
  errors: readonly ErrorSummaryItem[];
  /** The page moves focus here after a failed submit. */
  ref?: Ref<HTMLDivElement>;
}

function focusTarget(event: MouseEvent<HTMLAnchorElement>, targetId: string) {
  const target = document.getElementById(targetId);
  if (!target) return;
  // Focus explicitly: not every browser moves focus when following a fragment link.
  event.preventDefault();
  target.focus();
  target.scrollIntoView({ block: "center" });
}

/**
 * The list of errors above a form, as in GOV.UK Frontend: a focusable container with an
 * inner alert that holds the heading and one link per error.
 */
export function ErrorSummary({ title, errors, ref }: ErrorSummaryProps) {
  return (
    <div className="error-summary" ref={ref} tabIndex={-1}>
      <div role="alert">
        <h2 className="error-summary__title">{title}</h2>
        <ul className="error-summary__list">
          {errors.map((error) => (
            <li key={error.targetId}>
              <a
                href={`#${error.targetId}`}
                onClick={(event) => focusTarget(event, error.targetId)}
              >
                {error.message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
