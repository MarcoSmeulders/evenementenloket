import { useEffect, useRef, useState } from "react";
import "./LinkBox.css";

export interface LinkBoxProps {
  label: string;
  link: string;
  warning: string;
  copyLabel: string;
  copiedText: string;
  copyFailedText: string;
  mailLabel: string;
  /** A complete `mailto:` address with the link in the body. */
  mailHref: string;
}

/** Time the status region stays empty, so a repeated message is announced again. */
const RESET_DELAY_MS = 100;

/**
 * Shows the personal link with ways to keep it. The status region is always on the page and
 * is emptied before each new message: a live region only announces changes.
 */
export function LinkBox({
  label,
  link,
  warning,
  copyLabel,
  copiedText,
  copyFailedText,
  mailLabel,
  mailHref,
}: LinkBoxProps) {
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copyLink() {
    setStatus("");
    let message = copiedText;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      message = copyFailedText;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(message), RESET_DELAY_MS);
  }

  return (
    <div className="link-box">
      <p className="link-box__label">{label}</p>
      <p className="link-box__url">{link}</p>
      <p className="link-box__warning">{warning}</p>
      <div className="link-box__actions">
        <button type="button" className="button button--secondary" onClick={copyLink}>
          {copyLabel}
        </button>
        <a className="button button--secondary" href={mailHref}>
          {mailLabel}
        </a>
      </div>
      <p className="link-box__status" role="status">
        {status}
      </p>
    </div>
  );
}
