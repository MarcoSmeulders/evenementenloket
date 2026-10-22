export interface FieldErrorProps {
  id: string;
  /** The error message, already translated. */
  message: string;
  /** Hidden prefix for screen readers, for example "Fout: ". */
  prefix: string;
}

/** The error text next to a field. The prefix makes it clear it is an error when read alone. */
export function FieldError({ id, message, prefix }: FieldErrorProps) {
  return (
    <span className="field__error" id={id}>
      <span className="visually-hidden">{prefix}</span>
      {message}
    </span>
  );
}
