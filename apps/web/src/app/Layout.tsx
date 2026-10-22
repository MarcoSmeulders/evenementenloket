import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import { PageShell } from "../components/PageShell/PageShell";
import { queryClient } from "./queryClient";
import { useFocusHeadingOnNavigate } from "./useFocusHeadingOnNavigate";

export function Layout() {
  const { t } = useTranslation();
  useFocusHeadingOnNavigate();
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
