import { queryOptions } from "@tanstack/react-query";
import {
  draftResponseSchema,
  problemDetailSchema,
  type DraftResponse,
  type FieldError,
  type SaveIntent,
  type StepName,
} from "@evenementenloket/schema";
import { api } from "../../api/client";

/** An API error with the field error codes from its problem detail, if any. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: readonly FieldError[];

  constructor(status: number, fieldErrors: readonly FieldError[] = []) {
    super(`API responded ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function makeApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => undefined);
  const problem = problemDetailSchema.safeParse(body);
  return new ApiError(response.status, problem.success ? (problem.data.errors ?? []) : []);
}

/** The token is sent as a header, never in an API path, so it stays out of API logs. */
function withToken(token: string) {
  return { headers: { authorization: `Bearer ${token}` } };
}

export async function createDraft(): Promise<string> {
  const response = await api.api.applications.$post();
  if (!response.ok) throw await makeApiError(response);
  return (await response.json()).accessToken;
}

async function fetchDraft(token: string): Promise<DraftResponse> {
  const response = await api.api["my-application"].$get({}, withToken(token));
  if (!response.ok) throw await makeApiError(response);
  return response.json();
}

export async function saveStep(
  token: string,
  step: StepName,
  intent: SaveIntent,
  data: Record<string, unknown>,
): Promise<DraftResponse> {
  const response = await api.api["my-application"].steps[":step"].$put(
    { param: { step }, json: { intent, data } },
    withToken(token),
  );
  if (!response.ok) throw await makeApiError(response);
  // The validators can also answer with a problem detail, so the client cannot infer this
  // body's type; the shared schema checks it instead.
  return draftResponseSchema.parse(await response.json());
}

export function makeDraftQuery(token: string) {
  return queryOptions({ queryKey: ["draft", token], queryFn: () => fetchDraft(token) });
}
