import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { SkipLink } from "../SkipLink/SkipLink";
import "./PageShell.css";

export interface PageShellText {
  skipLink: string;
  service: string;
  municipality: string;
  /** Extra text for screen readers after the visible name of the home link. */
  homeLinkHint: string;
  footer: string;
}

export interface PageShellProps {
  text: PageShellText;
  children: ReactNode;
}

const MAIN_ID = "main";

/** The frame every page shares: skip link, header, main and footer. */
export function PageShell({ text, children }: PageShellProps) {
  return (
    <div className="page-shell">
      <SkipLink label={text.skipLink} targetId={MAIN_ID} />
      <header className="page-shell__header">
        {/* No aria-label: the accessible name is the visible text plus a hidden hint, so
            it always starts with what sighted users see (WCAG 2.5.3). NavLink sets
            aria-current="page" on the start page. */}
        <NavLink className="page-shell__home-link" to="/" end>
          <span className="page-shell__service">{text.service} </span>
          <span className="page-shell__municipality">{text.municipality}</span>
          <span className="visually-hidden">{text.homeLinkHint}</span>
        </NavLink>
      </header>
      <main id={MAIN_ID} className="page-shell__main" tabIndex={-1}>
        {children}
      </main>
      <footer className="page-shell__footer">
        <p>{text.footer}</p>
      </footer>
    </div>
  );
}
