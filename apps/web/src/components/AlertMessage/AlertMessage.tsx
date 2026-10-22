import type { Ref } from "react";
import "./AlertMessage.css";

export interface AlertMessageProps {
  title: string;
  message: string;
  /** The page moves focus here when the message appears. */
  ref?: Ref<HTMLDivElement>;
}

/** A message that something did not work, for example saving. Same pattern as the error summary. */
export function AlertMessage({ title, message, ref }: AlertMessageProps) {
  return (
    <div className="alert-message" ref={ref} tabIndex={-1}>
      <div role="alert">
        <h2 className="alert-message__title">{title}</h2>
        <p className="alert-message__text">{message}</p>
      </div>
    </div>
  );
}
