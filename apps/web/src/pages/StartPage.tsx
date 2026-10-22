import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { AlertMessage } from "../components/AlertMessage/AlertMessage";
import { createDraft } from "../features/draft/draftApi";
import { makeDraftPath } from "../features/draft/draftUtils";

export function StartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const alertRef = useRef<HTMLDivElement>(null);
  const start = useMutation({
    mutationFn: createDraft,
    onSuccess: (token) => void navigate(makeDraftPath(token, "link")),
  });

  useEffect(() => {
    if (start.isError) alertRef.current?.focus();
  }, [start.isError]);

  return (
    <>
      <title>{t("app.pageTitle", { page: t("start.title") })}</title>
      <h1 tabIndex={-1}>{t("start.title")}</h1>
      <p>{t("start.intro")}</p>
      <h2>{t("start.needTitle")}</h2>
      <ul>
        <li>{t("start.needOrganiser")}</li>
        <li>{t("start.needEvent")}</li>
      </ul>
      <p>{t("start.noLogin")}</p>
      {start.isError && (
        <AlertMessage title={t("start.failed")} message={t("loadError.intro")} ref={alertRef} />
      )}
      <button
        type="button"
        className="button"
        onClick={() => {
          if (!start.isPending) start.mutate();
        }}
      >
        {t("start.button")}
      </button>
    </>
  );
}
