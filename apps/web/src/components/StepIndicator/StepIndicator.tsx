import "./StepIndicator.css";

export interface StepIndicatorProps {
  /** Accessible name of the list, for example "Stappen". */
  label: string;
  steps: readonly string[];
  /** Index of the current step, from 0. */
  current: number;
}

/** The steps of the form as a plain list; not a navigation landmark, the items are not links. */
export function StepIndicator({ label, steps, current }: StepIndicatorProps) {
  return (
    <ol className="step-indicator" aria-label={label}>
      {steps.map((step, index) => (
        <li key={step} aria-current={index === current ? "step" : undefined}>
          {step}
        </li>
      ))}
    </ol>
  );
}
