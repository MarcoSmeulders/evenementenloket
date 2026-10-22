import type { DraftResponse } from "@evenementenloket/schema";

const PAGE_SEGMENTS = {
  link: "link",
  organiser: "organisator",
  event: "evenement",
  review: "controleren",
} as const;

export type DraftPage = keyof typeof PAGE_SEGMENTS;

/** `/aanvraag/<token>` resumes the draft; with a page it opens that page. */
export function makeDraftPath(token: string, page?: DraftPage): string {
  const base = `/aanvraag/${token}`;
  return page ? `${base}/${PAGE_SEGMENTS[page]}` : base;
}

/** The first step that is not complete, or the review page when both are. */
export function makeResumePage(draft: DraftResponse): DraftPage {
  if (!draft.steps.organiser.isComplete) return "organiser";
  if (!draft.steps.event.isComplete) return "event";
  return "review";
}

/** The full personal link, as the applicant should keep it. */
export function makePersonalLink(token: string): string {
  return new URL(makeDraftPath(token), window.location.origin).href;
}
