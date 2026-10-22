import { useTranslation } from "react-i18next";
import { ORGANISER_TYPES, organiserDraftSchema, organiserSchema } from "@evenementenloket/schema";
import { AlertMessage } from "../../../components/AlertMessage/AlertMessage";
import { ErrorSummary } from "../../../components/ErrorSummary/ErrorSummary";
import { RadioGroup, makeRadioId } from "../../../components/Field/RadioGroup";
import { TextField } from "../../../components/Field/TextField";
import { StepHeading } from "../StepHeading";
import { useDraft } from "../useDraft";
import { useStepForm } from "../useStepForm";

const FIELD_ORDER = ["organiserType", "organisationName", "contactName", "email", "phone"];

function makeTargetId(field: string) {
  return field === "organiserType" ? makeRadioId(field, ORGANISER_TYPES[0]) : field;
}

export function OrganiserStepPage() {
  const { t } = useTranslation();
  const { token, draft } = useDraft();
  const saved = draft.steps.organiser.data;
  const { form, onSubmit, summary, summaryRef, alertRef, fieldError, hasSaveFailed } = useStepForm({
    token,
    step: "organiser",
    nextPage: "event",
    defaultValues: {
      organiserType: saved?.organiserType ?? null,
      organisationName: saved?.organisationName ?? "",
      contactName: saved?.contactName ?? "",
      email: saved?.email ?? "",
      phone: saved?.phone ?? "",
    },
    draftSchema: organiserDraftSchema,
    makeCompleteSchema: () => organiserSchema,
    fieldOrder: FIELD_ORDER,
    makeTargetId,
  });
  const { register, watch } = form;
  const errorPrefix = t("steps.errorPrefix");
  const title = t("steps.organiser");
  const pageTitle = summary.length > 0 ? `${errorPrefix}${title}` : title;

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
        caption={t("steps.caption", { number: 1 })}
        title={title}
        stepsLabel={t("steps.label")}
        steps={[t("steps.organiser"), t("steps.event"), t("steps.review")]}
        current={0}
      />
      <form noValidate onSubmit={onSubmit}>
        <RadioGroup
          name="organiserType"
          legend={t("organiser.type.legend")}
          options={ORGANISER_TYPES.map((value) => ({ value, label: t(`organiser.type.${value}`) }))}
          registration={register("organiserType")}
          error={fieldError("organiserType")}
          errorPrefix={errorPrefix}
          conditional={{
            value: "organisation",
            isShown: watch("organiserType") === "organisation",
            content: (
              <TextField
                id="organisationName"
                label={t("organiser.organisationName")}
                autoComplete="organization"
                error={fieldError("organisationName")}
                errorPrefix={errorPrefix}
                {...register("organisationName", { shouldUnregister: true })}
              />
            ),
          }}
        />
        <TextField
          id="contactName"
          label={t("organiser.contactName")}
          hint={t("organiser.contactNameHint")}
          autoComplete="name"
          error={fieldError("contactName")}
          errorPrefix={errorPrefix}
          {...register("contactName")}
        />
        <TextField
          id="email"
          type="email"
          label={t("organiser.email")}
          autoComplete="email"
          spellCheck={false}
          error={fieldError("email")}
          errorPrefix={errorPrefix}
          {...register("email")}
        />
        <TextField
          id="phone"
          type="tel"
          label={t("organiser.phone")}
          autoComplete="tel"
          error={fieldError("phone")}
          errorPrefix={errorPrefix}
          {...register("phone")}
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
