import type { MouseEvent } from "react";
import "./SkipLink.css";

export interface SkipLinkProps {
  /** Visible link text, already translated. */
  label: string;
  /** ID of the element that receives focus. It must be focusable (tabIndex -1). */
  targetId: string;
}

export function SkipLink({ label, targetId }: SkipLinkProps) {
  function moveFocus(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(targetId);
    if (!target) return;
    // Focus explicitly: not every browser moves focus when following a fragment link.
    event.preventDefault();
    target.focus();
  }

  return (
    <a className="skip-link" href={`#${targetId}`} onClick={moveFocus}>
      {label}
    </a>
  );
}
