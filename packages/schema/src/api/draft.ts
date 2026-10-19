import { z } from "zod";
import { eventDraftSchema } from "../domain/event";
import { organiserDraftSchema } from "../domain/organiser";

/** A draft that has not been saved for this many days is deleted. */
export const DRAFT_RETENTION_DAYS = 30;

/** 32 random bytes, base64url without padding. */
export const accessTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/)
  .brand<"AccessToken">();
export type AccessToken = z.infer<typeof accessTokenSchema>;

export const applicationIdSchema = z.uuid().brand<"ApplicationId">();
export type ApplicationId = z.infer<typeof applicationIdSchema>;

export const STEP_NAMES = ["organiser", "event"] as const;
export const stepNameSchema = z.enum(STEP_NAMES);
export type StepName = z.infer<typeof stepNameSchema>;

/** "continue" needs a complete step, "later" only valid formats. */
export const saveIntentSchema = z.enum(["continue", "later"]);
export type SaveIntent = z.infer<typeof saveIntentSchema>;

/** The step data is checked by the step's own schema, chosen by the route and the intent. */
export const saveStepRequestSchema = z.object({
  intent: saveIntentSchema,
  data: z.record(z.string(), z.unknown()),
});
export type SaveStepRequest = z.infer<typeof saveStepRequestSchema>;

export const createDraftResponseSchema = z.object({
  accessToken: accessTokenSchema,
});
export type CreateDraftResponse = z.infer<typeof createDraftResponseSchema>;

export const draftResponseSchema = z.object({
  status: z.literal("draft"),
  steps: z.object({
    organiser: z.object({ data: organiserDraftSchema.nullable(), isComplete: z.boolean() }),
    event: z.object({ data: eventDraftSchema.nullable(), isComplete: z.boolean() }),
  }),
});
export type DraftResponse = z.infer<typeof draftResponseSchema>;
