import { useTranslation } from "react-i18next";
import { formatDateTime } from "@evenementenloket/schema";
import { makeDraftPath } from "../draftUtils";
import { StepHeading } from "../StepHeading";
import { useDraft, useSavedStep } from "../useDraft";
import "./ReviewPage.css";

/** All answers, read-only. Changing and submitting arrive in add-review-and-submit. */
export function ReviewPage() {
  const { t } = useTranslation();
  const { token, draft } = useDraft();
  const savedStep = useSavedStep();
  const organiser = draft.steps.organiser.data;
  const event = draft.steps.event.data;
  const title = t("review.title");
  const notFilledIn = t("review.notFilledIn");

  function show(value: string | null | undefined) {
    return value ? value : notFilledIn;
  }

  function showDateTime(date: string | undefined, time: string | undefined) {
    return date && time ? formatDateTime(date, time) : notFilledIn;
  }

  const organiserRows = [
    [
      t("organiser.type.legend"),
      organiser?.organiserType ? t(`organiser.type.${organiser.organiserType}`) : notFilledIn,
    ],
    ...(organiser?.organiserType === "organisation"
      ? [[t("organiser.organisationName"), show(organiser.organisationName)]]
      : []),
    [t("organiser.contactName"), show(organiser?.contactName)],
    [t("organiser.email"), show(organiser?.email)],
    [t("organiser.phone"), show(organiser?.phone)],
  ];

  const eventRows = [
    [t("event.eventName"), show(event?.eventName)],
    [
      t("event.eventType.legend"),
      event?.eventType ? t(`event.eventType.${event.eventType}`) : notFilledIn,
    ],
    ...(event?.eventType === "other"
      ? [[t("event.eventTypeOther"), show(event.eventTypeOther)]]
      : []),
    [t("event.location"), show(event?.location)],
    [t("event.start"), showDateTime(event?.startDate, event?.startTime)],
    [t("event.end"), showDateTime(event?.endDate, event?.endTime)],
    [
      t("event.visitors.legend"),
      event?.visitors ? t(`event.visitors.${event.visitors}`) : notFilledIn,
    ],
    [t("event.description"), show(event?.description)],
  ];

  const sections = [
    { id: "organiser", heading: t("steps.organiser"), rows: organiserRows },
    { id: "event", heading: t("steps.event"), rows: eventRows },
  ];

  return (
    <>
      <title>{t("app.pageTitle", { page: title })}</title>
      <StepHeading
        caption={t("steps.caption", { number: 3 })}
        title={title}
        stepsLabel={t("steps.label")}
        steps={[t("steps.organiser"), t("steps.event"), t("steps.review")]}
        current={2}
        back={{ to: makeDraftPath(token, "event"), label: t("steps.back") }}
        confirmation={savedStep === "event" ? t("steps.saved.event") : undefined}
      />
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`review-${section.id}`}>
          <h2 id={`review-${section.id}`}>{section.heading}</h2>
          <dl className="review-list">
            {section.rows.map(([label, value]) => (
              <div className="review-list__row" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <p className="confirmation">{t("review.notYet")}</p>
    </>
  );
}
