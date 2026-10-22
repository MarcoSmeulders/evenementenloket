import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { validator } from "hono/validator";
import {
  accessTokenSchema,
  eventDraftSchema,
  makeEventSchema,
  makeFieldErrors,
  organiserDraftSchema,
  organiserSchema,
  saveStepRequestSchema,
  stepNameSchema,
  type ApplicationId,
  type CreateDraftResponse,
  type DraftResponse,
  type SaveIntent,
  type StepName,
} from "@evenementenloket/schema";
import { problem } from "../problem";
import type { ApplicationRepository, StoredDraft } from "./repository";
import { isExpired } from "./retention";
import { createAccessToken, makeTokenHash } from "./token";

type DraftEnv = { Variables: { draft: StoredDraft } };

/** "continue" needs a complete step, "later" only checks the format of what is filled in. */
function makeStepSchema(step: StepName, intent: SaveIntent, now: Date) {
  if (step === "organiser") return intent === "continue" ? organiserSchema : organiserDraftSchema;
  return intent === "continue" ? makeEventSchema(now) : eventDraftSchema;
}

/** Whether a step is complete is never stored; it follows from the complete schema. */
export function makeDraftResponse(draft: StoredDraft, now: Date): DraftResponse {
  return {
    status: "draft",
    steps: {
      organiser: {
        data: draft.organiser,
        isComplete: draft.organiser !== null && organiserSchema.safeParse(draft.organiser).success,
      },
      event: {
        data: draft.event,
        isComplete: draft.event !== null && makeEventSchema(now).safeParse(draft.event).success,
      },
    },
  };
}

export function makeDraftRoutes(repository: ApplicationRepository, now: () => Date) {
  /**
   * Finds the draft for the Bearer token. An unknown, a malformed and an expired token get
   * the same 404, so a client cannot learn whether a draft exists.
   */
  const requireDraft = createMiddleware<DraftEnv>(async (c, next) => {
    const header = c.req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      c.header("WWW-Authenticate", "Bearer");
      return problem(c, 401);
    }
    const token = accessTokenSchema.safeParse(header.slice("Bearer ".length).trim());
    const draft = token.success ? repository.findByTokenHash(makeTokenHash(token.data)) : undefined;
    if (!draft || isExpired(draft, now())) return problem(c, 404);
    c.set("draft", draft);
    await next();
  });

  return new Hono()
    .post("/api/applications", (c) => {
      const accessToken = createAccessToken();
      repository.create(randomUUID() as ApplicationId, makeTokenHash(accessToken), now());
      return c.json<CreateDraftResponse>({ accessToken }, 201);
    })
    .get("/api/my-application", requireDraft, (c) => {
      return c.json<DraftResponse>(makeDraftResponse(c.var.draft, now()));
    })
    .put(
      "/api/my-application/steps/:step",
      requireDraft,
      // The validators also give the typed client the shape of the request.
      validator("param", (value, c) => {
        const step = stepNameSchema.safeParse(value.step);
        return step.success ? { step: step.data } : problem(c, 404);
      }),
      validator("json", (value, c) => {
        const request = saveStepRequestSchema.safeParse(value);
        return request.success ? request.data : problem(c, 400);
      }),
      (c) => {
        const { step } = c.req.valid("param");
        const request = c.req.valid("json");
        const draft = c.var.draft;
        // Submitted reports are read-only; this guards add-review-and-submit.
        if (draft.status !== "draft") return problem(c, 409);

        const at = now();
        const result = makeStepSchema(step, request.intent, at).safeParse(request.data);
        if (!result.success) {
          return problem(c, 422, undefined, { errors: makeFieldErrors(result.error) });
        }

        const saved = repository.saveStep(draft.id, step, result.data, at);
        return c.json<DraftResponse>(makeDraftResponse(saved, at));
      },
    );
}
