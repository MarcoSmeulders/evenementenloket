import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router";
import type { StepName } from "@evenementenloket/schema";
import { makeDraftQuery } from "./draftApi";

/** The draft of the current address. The route loader has already put it in the cache. */
export function useDraft() {
  const { token = "" } = useParams();
  const { data } = useSuspenseQuery(makeDraftQuery(token));
  return { token, draft: data };
}

/** Navigation state that says which step was just saved, so the next page can confirm it. */
export interface SavedState {
  saved?: StepName;
}

export function useSavedStep(): StepName | undefined {
  const state = useLocation().state as SavedState | null;
  return state?.saved;
}

/** Turns a field error code into its message: a field-specific text if there is one. */
export function useFieldErrorText() {
  const { t } = useTranslation();
  return (field: string, code: string) =>
    t(`errors.fields.${field}.${code}`, {
      defaultValue: t(`errors.generic.${code}`, { defaultValue: t("errors.generic.invalid") }),
    });
}
