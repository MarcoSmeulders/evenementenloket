import { Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import { PageShell } from "../components/PageShell/PageShell";

export function Layout() {
  const { t } = useTranslation();
  return (
    <PageShell
      text={{
        skipLink: t("skipLink"),
        service: t("app.service"),
        municipality: t("app.municipality"),
        homeLinkHint: t("app.homeLinkHint"),
        footer: t("footer.disclaimer"),
      }}
    >
      <Outlet />
    </PageShell>
  );
}
