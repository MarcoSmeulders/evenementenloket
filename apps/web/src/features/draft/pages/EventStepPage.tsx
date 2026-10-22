import { useTranslation } from "react-i18next";
import {
  DESCRIPTION_MAX,
  EVENT_TYPES,
  VISITOR_GROUPS,
  eventDraftSchema,
  makeEventSchema,
} from "@evenementenloket/schema";
import { AlertMessage } from "../../../components/AlertMessage/AlertMessage";
import { ErrorSummary } from "../../../components/ErrorSummary/ErrorSummary";
import { CharacterCount } from "../../../components/Field/CharacterCount";
import { DateTimeGroup } from "../../../components/Field/DateTimeGroup";
import { RadioGroup, makeRadioId } from "../../../components/Field/RadioGroup";
import { TextField } from "../../../components/Field/TextField";
import { makeDraftPath } from "../draftUtils";
import { StepHeading } from "../StepHeading";
import { useDraft, useSavedStep } from "../useDraft";
import { useStepForm } from "../useStepForm";

const FIELD_ORDER = [
  "eventName",
  "eventType",
  "eventTypeOther",
  "location",
  "startDate",
  "startTime",
  "endDate",
  "endTime",
  "visitors",
  "description",
];

function makeTargetId(field: string) {
  if (field === "eventType") return makeRadioId(field, EVENT_TYPES[0]);
  if (field === "visitors") return makeRadioId(field, VISITOR_GROUPS[0]);
  return field;
}

export function EventStepPage() {
  const { t } = useTranslation();
  const { token, draft } = useDraft();
  const savedStep = useSavedStep();
  const saved = draft.steps.event.data;
  const { form, onSubmit, summary, summaryRef, alertRef, fieldError, hasSaveFailed } = useStepForm({
    token,
    step: "event",
    nextPage: "review",
    defaultValues: {
      eventName: saved?.eventName ?? "",
      eventType: saved?.eventType ?? null,
      eventTypeOther: saved?.eventTypeOther ?? "",
      location: saved?.location ?? "",
      startDate: saved?.startDate ?? "",
      startTime: saved?.startTime ?? "",
      endDate: saved?.endDate ?? "",
      endTime: saved?.endTime ?? "",
      visitors: saved?.visitors ?? null,
      description: saved?.description ?? "",
    },
    draftSchema: eventDraftSchema,
    makeCompleteSchema: () => makeEventSchema(new Date()),
    fieldOrder: FIELD_ORDER,
    makeTargetId,
  });
  const { register, watch } = form;
  const errorPrefix = t("steps.errorPrefix");
  const title = t("steps.event");
  const pageTitle = summary.length > 0 ? `${errorPrefix}${title}` : title;
  const startError = fieldError("startDate") ?? fieldError("startTime");
  const endError = fieldError("endDate") ?? fieldError("endTime");

  return (
    <>
      <title>{t("app.pageTitle", { page: pageTitle })}</title>
      {summary.length > 0 && (
        <ErrorSummary title={t("steps.errorSummary")} errors={summary} ref={summaryRef} />
      )}
      {hasSaveFailed && (
        <AlertMessage
          title={t("steps.saveFailedTitle")}
          message={t("steps.saveFailed")}
          ref={alertRef}
        />
      )}
      <StepHeading
        caption={t("steps.caption", { number: 2 })}
        title={title}
        stepsLabel={t("steps.label")}
        steps={[t("steps.organiser"), t("steps.event"), t("steps.review")]}
        current={1}
        back={{ to: makeDraftPath(token, "organiser"), label: t("steps.back") }}
        confirmation={savedStep === "organiser" ? t("steps.saved.organiser") : undefined}
      />
      <form noValidate onSubmit={onSubmit}>
        <TextField
          id="eventName"
          label={t("event.eventName")}
          hint={t("event.eventNameHint")}
          error={fieldError("eventName")}
          errorPrefix={errorPrefix}
          {...register("eventName")}
        />
        <RadioGroup
          name="eventType"
          legend={t("event.eventType.legend")}
          options={EVENT_TYPES.map((value) => ({ value, label: t(`event.eventType.${value}`) }))}
          registration={register("eventType")}
          error={fieldError("eventType")}
          errorPrefix={errorPrefix}
          conditional={{
            value: "other",
            isShown: watch("eventType") === "other",
            content: (
              <TextField
                id="eventTypeOther"
                label={t("event.eventTypeOther")}
                error={fieldError("eventTypeOther")}
                errorPrefix={errorPrefix}
                {...register("eventTypeOther", { shouldUnregister: true })}
              />
            ),
          }}
        />
        <TextField
          id="location"
          label={t("event.location")}
          hint={t("event.locationHint")}
          error={fieldError("location")}
          errorPrefix={errorPrefix}
          {...register("location")}
        />
        <DateTimeGroup
          id="start"
          legend={t("event.start")}
          dateLabel={t("event.date")}
          timeLabel={t("event.time")}
          date={{
            id: "startDate",
            registration: register("startDate"),
            isInvalid: Boolean(fieldError("startDate")),
          }}
          time={{
            id: "startTime",
            registration: register("startTime"),
            isInvalid: Boolean(fieldError("startTime")),
          }}
          error={startError}
          errorPrefix={errorPrefix}
        />
        <DateTimeGroup
          id="end"
          legend={t("event.end")}
          dateLabel={t("event.date")}
          timeLabel={t("event.time")}
          date={{
            id: "endDate",
            registration: register("endDate"),
            isInvalid: Boolean(fieldError("endDate")),
          }}
          time={{
            id: "endTime",
            registration: register("endTime"),
            isInvalid: Boolean(fieldError("endTime")),
          }}
          error={endError}
          errorPrefix={errorPrefix}
        />
        <RadioGroup
          name="visitors"
          legend={t("event.visitors.legend")}
          options={VISITOR_GROUPS.map((value) => ({ value, label: t(`event.visitors.${value}`) }))}
          registration={register("visitors")}
          error={fieldError("visitors")}
          errorPrefix={errorPrefix}
        />
        <CharacterCount
          id="description"
          label={t("event.description")}
          hint={t("event.descriptionHint")}
          error={fieldError("description")}
          errorPrefix={errorPrefix}
          text={watch("description") ?? ""}
          maxLength={DESCRIPTION_MAX}
          makeCountText={(remaining) =>
            remaining >= 0
              ? t("event.charactersLeft", { count: remaining })
              : t("event.charactersOver", { count: -remaining })
          }
          {...register("description")}
        />
        <div className="button-row">
          <button type="submit" className="button" value="continue">
            {t("steps.saveContinue")}
          </button>
          <button type="submit" className="button button--secondary" value="later">
            {t("steps.saveLater")}
          </button>
        </div>
      </form>
    </>
  );
}
