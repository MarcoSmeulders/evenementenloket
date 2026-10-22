import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { z } from "zod";
import {
  eventDraftSchema,
  organiserDraftSchema,
  type ApplicationId,
  type EventDraft,
  type OrganiserDraft,
  type StepName,
} from "@evenementenloket/schema";

export interface StoredDraft {
  readonly id: ApplicationId;
  /** Raw from the database; this change only creates drafts. */
  readonly status: string;
  readonly organiser: OrganiserDraft | null;
  readonly event: EventDraft | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type StepData = OrganiserDraft | EventDraft;

/** Storage for drafts. One implementation on SQLite; the routes only know this interface. */
export interface ApplicationRepository {
  create(id: ApplicationId, tokenHash: string, now: Date): void;
  findByTokenHash(tokenHash: string): StoredDraft | undefined;
  saveStep(id: ApplicationId, step: StepName, data: StepData, now: Date): StoredDraft;
  /** Deletes drafts whose last save is before `cutoff`; returns how many. */
  deleteNotSavedSince(cutoff: Date): number;
}

interface DraftRow {
  id: string;
  status: string;
  organiser: string | null;
  event: string | null;
  created_at: string;
  updated_at: string;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS applications (
    id          TEXT PRIMARY KEY,
    token_hash  TEXT NOT NULL UNIQUE,
    status      TEXT NOT NULL CHECK (status IN ('draft')),
    organiser   TEXT,
    event       TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  )`;

/** Stored JSON is checked again on read; data that no longer fits the schema counts as empty. */
function parseStep<T extends z.ZodType>(json: string | null, schema: T): z.infer<T> | null {
  if (json === null) return null;
  const result = schema.safeParse(JSON.parse(json));
  return result.success ? result.data : null;
}

function makeDraft(row: DraftRow): StoredDraft {
  return {
    id: row.id as ApplicationId,
    status: row.status,
    organiser: parseStep(row.organiser, organiserDraftSchema),
    event: parseStep(row.event, eventDraftSchema),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Opens the database file (creating its folder) or an in-memory database for `:memory:`. */
export function openDatabase(databasePath: string): DatabaseSync {
  if (databasePath !== ":memory:") mkdirSync(dirname(databasePath), { recursive: true });
  return new DatabaseSync(databasePath);
}

export function makeApplicationRepository(db: DatabaseSync): ApplicationRepository {
  db.exec(SCHEMA);

  const insert = db.prepare(
    "INSERT INTO applications (id, token_hash, status, created_at, updated_at) VALUES (?, ?, 'draft', ?, ?)",
  );
  const selectByHash = db.prepare("SELECT * FROM applications WHERE token_hash = ?");
  const selectById = db.prepare("SELECT * FROM applications WHERE id = ?");
  // The step name selects one of two fixed statements, so no column name is built from input.
  const updateStep = {
    organiser: db.prepare("UPDATE applications SET organiser = ?, updated_at = ? WHERE id = ?"),
    event: db.prepare("UPDATE applications SET event = ?, updated_at = ? WHERE id = ?"),
  };
  const deleteOld = db.prepare("DELETE FROM applications WHERE updated_at < ?");

  return {
    create(id, tokenHash, now) {
      insert.run(id, tokenHash, now.toISOString(), now.toISOString());
    },
    findByTokenHash(tokenHash) {
      const row = selectByHash.get(tokenHash) as DraftRow | undefined;
      return row ? makeDraft(row) : undefined;
    },
    saveStep(id, step, data, now) {
      updateStep[step].run(JSON.stringify(data), now.toISOString(), id);
      return makeDraft(selectById.get(id) as unknown as DraftRow);
    },
    deleteNotSavedSince(cutoff) {
      return Number(deleteOld.run(cutoff.toISOString()).changes);
    },
  };
}
