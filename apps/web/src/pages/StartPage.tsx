import { useTranslation } from "react-i18next";

export function StartPage() {
  const { t } = useTranslation();
  return (
    <>
      <title>{t("app.pageTitle", { page: t("start.title") })}</title>
      <h1>{t("start.title")}</h1>
      <p>{t("start.intro")}</p>
    </>
  );
}
