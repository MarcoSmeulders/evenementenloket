import { Link } from "react-router";
import "./BackLink.css";

export interface BackLinkProps {
  to: string;
  label: string;
}

/** A link to the previous page of the form (GOV.UK back link). It does not save anything. */
export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link className="back-link" to={to}>
      {label}
    </Link>
  );
}
