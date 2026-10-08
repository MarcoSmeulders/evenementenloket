import { z } from "zod";

/** Error body shared by every API error response (RFC 9457). */
export const problemDetailSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  status: z.int().min(400).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
});

export type ProblemDetail = z.infer<typeof problemDetailSchema>;

export const PROBLEM_CONTENT_TYPE = "application/problem+json";
