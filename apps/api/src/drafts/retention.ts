import { DRAFT_RETENTION_DAYS } from "@evenementenloket/schema";
import type { ApplicationRepository, StoredDraft } from "./repository";

const DAY_MS = 24 * 60 * 60 * 1000;

/** The moment before which a draft's last save makes it expired. */
function makeCutoff(now: Date): Date {
  return new Date(now.getTime() - DRAFT_RETENTION_DAYS * DAY_MS);
}

/** Drafts hold personal data: delete those that were not saved for the retention period. */
export function deleteExpiredDrafts(repository: ApplicationRepository, now: Date): number {
  return repository.deleteNotSavedSince(makeCutoff(now));
}

/** Checked on every lookup, so the term is exact and does not wait for the next cleanup. */
export function isExpired(draft: StoredDraft, now: Date): boolean {
  return new Date(draft.updatedAt) < makeCutoff(now);
}

/**
 * Runs the cleanup now and then every 24 hours. `unref()` lets the process stop while the
 * timer is still set. Started by server.ts only, so tests never get a timer.
 */
export function startDraftCleanup(
  repository: ApplicationRepository,
  now: () => Date,
  onCleanup: (deleted: number) => void,
): () => void {
  const run = () => onCleanup(deleteExpiredDrafts(repository, now()));
  run();
  const timer = setInterval(run, DAY_MS);
  timer.unref();
  return () => clearInterval(timer);
}
