import { useTranslation } from "react-i18next";
import { Link, useRouteError } from "react-router";
import { DRAFT_RETENTION_DAYS } from "@evenementenloket/schema";
import { ApiError } from "../draftApi";

/**
 * Error element of the /aanvraag/:token routes. An unknown, malformed or expired token all
 * give the same page, so it does not reveal whether a report exists.
 */
export function DraftErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  const isInvalidLink = error instanceof ApiError && error.status === 404;
  const title = isInvalidLink ? t("invalidLink.title") : t("loadError.title");

  return (
    <>
      <title>{t("app.pageTitle", { page: title })}</title>
      <h1 tabIndex={-1}>{title}</h1>
      {isInvalidLink ? (
        <>
          <p>{t("invalidLink.intro")}</p>
          <p>{t("invalidLink.retention", { days: DRAFT_RETENTION_DAYS })}</p>
          <p>
            <Link to="/">{t("invalidLink.startLink")}</Link>
          </p>
        </>
      ) : (
        <>
          <p>{t("loadError.intro")}</p>
          <p>
            <Link to="/">{t("loadError.startLink")}</Link>
          </p>
        </>
      )}
    </>
  );
}
