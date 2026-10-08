import i18next, { type i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import nl from "./nl.json";

export type Translation = typeof nl;

/**
 * Creates an i18next instance with the resources bundled in, so text is available
 * on the first render. Tests pass their own translation to check that no text
 * bypasses the translation files.
 */
export function createI18n(translation: Translation = nl): i18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources: { nl: { translation } },
    lng: "nl",
    fallbackLng: "nl",
    initAsync: false,
    interpolation: { escapeValue: false },
  });
  return instance;
}
