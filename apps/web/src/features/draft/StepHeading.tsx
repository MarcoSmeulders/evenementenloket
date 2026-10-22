import { BackLink } from "../../components/BackLink/BackLink";
import { StepIndicator } from "../../components/StepIndicator/StepIndicator";

export interface StepHeadingProps {
  /** For example "Stap 2 van 3". */
  caption: string;
  title: string;
  stepsLabel: string;
  steps: readonly string[];
  current: number;
  back?: { to: string; label: string };
  /** Shown as plain text directly after the heading, for example "Stap 1 is opgeslagen." */
  confirmation?: string;
}

/**
 * The top of a step page: back link, step indicator, the heading that receives focus on a
 * page change, and the confirmation of the step saved before.
 */
export function StepHeading({
  caption,
  title,
  stepsLabel,
  steps,
  current,
  back,
  confirmation,
}: StepHeadingProps) {
  return (
    <>
      {back && <BackLink to={back.to} label={back.label} />}
      <StepIndicator label={stepsLabel} steps={steps} current={current} />
      <h1 tabIndex={-1}>
        <span className="heading-caption">
          {caption}
          <span className="visually-hidden">: </span>
        </span>
        {title}
      </h1>
      {confirmation && <p className="confirmation">{confirmation}</p>}
    </>
  );
}
