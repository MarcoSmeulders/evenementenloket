import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { RouterProvider, createBrowserRouter } from "react-router";
import { routes } from "./app/routes";
import { createI18n } from "./i18n/i18n";
import "./styles/tokens.css";
import "./styles/base.css";

const i18n = createI18n();
document.documentElement.lang = i18n.language;

const router = createBrowserRouter(routes);
const root = document.getElementById("root");
if (!root) throw new Error("Root element #root is missing from index.html");

createRoot(root).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>
  </StrictMode>,
);
