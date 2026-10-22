import { useEffect, useRef, useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type DefaultValues, type FieldValues, type Resolver } from "react-hook-form";
import { useNavigate } from "react-router";
import type { z } from "zod";
import type { SaveIntent, StepName } from "@evenementenloket/schema";
import type { ErrorSummaryItem } from "../../components/ErrorSummary/ErrorSummary";
import { ApiError, makeDraftQuery, saveStep } from "./draftApi";
import { makeDraftPath, type DraftPage } from "./draftUtils";
import { useFieldErrorText, type SavedState } from "./useDraft";

interface StepFormOptions<T extends FieldValues> {
  token: string;
  step: StepName;
  /** The page "Opslaan en verder" opens. */
  nextPage: DraftPage;
  defaultValues: DefaultValues<T>;
  draftSchema: z.ZodType;
  /** Built at submit time, because the event rules depend on the current time. */
  makeCompleteSchema: () => z.ZodType;
  /** Field names in screen order, so the error summary follows the form. */
  fieldOrder: readonly string[];
  /** The element a summary link moves focus to (the first radio for a radio group). */
  makeTargetId: (field: string) => string;
}

/**
 * Shared behaviour of a step form: errors only change on submit, the button decides between
 * the draft and the complete schema, the error summary gets focus, server errors look the
 * same as browser errors, and a failed save keeps the answers.
 */
export function useStepForm<T extends FieldValues>(options: StepFormOptions<T>) {
  const { token, step, nextPage, draftSchema, makeCompleteSchema, fieldOrder, makeTargetId } =
    options;
  const intent = useRef<SaveIntent>("continue");
  const summaryRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const [focusRequest, setFocusRequest] = useState({ target: "none", count: 0 });
  const errorText = useFieldErrorText();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const resolver: Resolver<T> = (values, context, resolverOptions) => {
    const schema = intent.current === "continue" ? makeCompleteSchema() : draftSchema;
    // The resolver is chosen per submit; its generic types cannot follow that choice.
    return (zodResolver(schema as never) as unknown as Resolver<T>)(
      values,
      context,
      resolverOptions,
    );
  };

  const form = useForm<T>({
    defaultValues: options.defaultValues,
    resolver,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    // Focus goes to the error summary, not to the first invalid field (GOV.UK pattern).
    shouldFocusError: false,
  });

  const save = useMutation({
    mutationFn: (data: T) => saveStep(token, step, intent.current, data),
    onSuccess: (draft) => {
      queryClient.setQueryData(makeDraftQuery(token).queryKey, draft);
      const state: SavedState = { saved: step };
      const page = intent.current === "continue" ? nextPage : "link";
      void navigate(makeDraftPath(token, page), { state });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 422 && error.fieldErrors.length > 0) {
        for (const fieldError of error.fieldErrors) {
          form.setError(fieldError.field as never, { type: "server", message: fieldError.code });
        }
        setFocusRequest((request) => ({ target: "summary", count: request.count + 1 }));
        return;
      }
      setFocusRequest((request) => ({ target: "alert", count: request.count + 1 }));
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    intent.current = submitter?.value === "later" ? "later" : "continue";
    save.reset();
    void form.handleSubmit(
      (data) => save.mutate(data),
      () => setFocusRequest((request) => ({ target: "summary", count: request.count + 1 })),
    )(event);
  }

  const errors = form.formState.errors;
  const summary: ErrorSummaryItem[] = fieldOrder.flatMap((field) => {
    const code = errors[field]?.message;
    return typeof code === "string"
      ? [{ targetId: makeTargetId(field), message: errorText(field, code) }]
      : [];
  });

  // react-hook-form may publish the errors one render after the focus request, so this also
  // runs when the summary appears.
  const hasSummary = summary.length > 0;
  useEffect(() => {
    if (focusRequest.target === "summary" && hasSummary) summaryRef.current?.focus();
    if (focusRequest.target === "alert") alertRef.current?.focus();
  }, [focusRequest, hasSummary]);

  /** The translated error of one field, or undefined. */
  function fieldError(field: string): string | undefined {
    const code = errors[field]?.message;
    return typeof code === "string" ? errorText(field, code) : undefined;
  }

  const hasSaveFailed = save.isError && focusRequest.target === "alert";

  return { form, onSubmit, summary, summaryRef, alertRef, fieldError, hasSaveFailed };
}
