import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { DRAFT_RETENTION_DAYS } from "@evenementenloket/schema";
import { LinkBox } from "../../../components/LinkBox/LinkBox";
import { makeDraftPath, makePersonalLink } from "../draftUtils";
import { useDraft, useSavedStep } from "../useDraft";

/**
 * Shown after "Start melding" and after "Opslaan en later verdergaan". After a save, the
 * heading and the page title say which step was saved; that is where focus lands, so screen
 * reader users hear it first.
 */
export function LinkPage() {
  const { t } = useTranslation();
  const { token, draft } = useDraft();
  const savedStep = useSavedStep();
  const link = makePersonalLink(token);
  const title = savedStep ? t(`link.saved.${savedStep}`) : t("link.title");
  const isEmpty = draft.steps.organiser.data === null && draft.steps.event.data === null;
  const mailHref =
    `mailto:?subject=${encodeURIComponent(t("link.mailSubject"))}` +
    `&body=${encodeURIComponent(t("link.mailBody", { link }))}`;

  return (
    <>
      <title>{t("app.pageTitle", { page: title })}</title>
      <h1 tabIndex={-1}>{title}</h1>
      <p>{savedStep ? t("link.savedIntro") : t("link.intro")}</p>
      <LinkBox
        label={t("link.label")}
        link={link}
        warning={t("link.warning")}
        copyLabel={t("link.copy")}
        copiedText={t("link.copied")}
        copyFailedText={t("link.copyFailed")}
        mailLabel={t("link.mail")}
        mailHref={mailHref}
      />
      <p>{t("link.bookmark")}</p>
      <p>{t("link.retention", { days: DRAFT_RETENTION_DAYS })}</p>
      <div className="button-row">
        {/* Goes where the personal link goes: the first step that is not complete. */}
        <Link className="button" to={makeDraftPath(token)}>
          {isEmpty ? t("link.continueStart") : t("link.continue")}
        </Link>
      </div>
    </>
  );
}
