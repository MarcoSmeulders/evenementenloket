import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, test } from "vitest";
import {
  createDraftResponseSchema,
  draftResponseSchema,
  problemDetailSchema,
  type ApplicationId,
  type OrganiserDraft,
} from "@evenementenloket/schema";
import { buildApp } from "../app";
import { loadConfig } from "../config";
import { makeApplicationRepository } from "./repository";
import { deleteExpiredDrafts } from "./retention";

const DAY_MS = 24 * 60 * 60 * 1000;
const START = new Date("2027-01-15T10:00:00Z");

const VALID_ORGANISER: OrganiserDraft = {
  organiserType: "private",
  organisationName: "",
  contactName: "Sanne de Vries",
  email: "sanne@example.org",
  phone: "",
};

/** An app on an in-memory database with a clock the test can move. */
function setup() {
  const db = new DatabaseSync(":memory:");
  const repository = makeApplicationRepository(db);
  let now = START;
  const app = buildApp(loadConfig({ LOG_LEVEL: "silent", NODE_ENV: "test" }), {
    repository,
    now: () => now,
  });
  return {
    db,
    repository,
    app,
    setNow: (date: Date) => {
      now = date;
    },
    async createDraft() {
      const response = await app.request("/api/applications", { method: "POST" });
      return createDraftResponseSchema.parse(await response.json()).accessToken;
    },
    getDraft(token: string) {
      return app.request("/api/my-application", { headers: { authorization: `Bearer ${token}` } });
    },
    saveStep(token: string, step: string, body: unknown) {
      return app.request(`/api/my-application/steps/${step}`, {
        method: "PUT",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    },
  };
}

describe("draft-application: Start a draft", () => {
  test("API creates a draft with a one-time token", async () => {
    const { app, getDraft } = setup();

    const response = await app.request("/api/applications", { method: "POST" });

    expect(response.status).toBe(201);
    const { accessToken } = createDraftResponseSchema.parse(await response.json());
    expect(accessToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const draft = draftResponseSchema.parse(await (await getDraft(accessToken)).json());
    expect(draft.steps).toEqual({
      organiser: { data: null, isComplete: false },
      event: { data: null, isComplete: false },
    });
  });
});

describe("draft-application: Token stored as a hash", () => {
  test("database holds no token", async () => {
    const { db, createDraft } = setup();

    const token = await createDraft();

    const rows = db.prepare("SELECT * FROM applications").all();
    expect(rows).toHaveLength(1);
    expect(JSON.stringify(rows)).not.toContain(token);
    expect(rows[0]?.token_hash).toBe(createHash("sha256").update(token).digest("hex"));
  });
});

describe("draft-application: Access requires the token", () => {
  test("request without a token", async () => {
    const { app } = setup();

    const response = await app.request("/api/my-application");

    expect(response.status).toBe(401);
    expect(problemDetailSchema.parse(await response.json()).status).toBe(401);
  });

  test("unknown or malformed token", async () => {
    const { getDraft } = setup();

    const unknown = await getDraft("A".repeat(43));
    const malformed = await getDraft("not-a-token");

    expect(unknown.status).toBe(404);
    expect(malformed.status).toBe(404);
    expect(await unknown.text()).toBe(await malformed.text());
  });
});

describe("draft-application: Save a complete step", () => {
  test("API rejects an incomplete step on continue", async () => {
    const { createDraft, saveStep, getDraft } = setup();
    const token = await createDraft();

    const response = await saveStep(token, "organiser", {
      intent: "continue",
      data: { ...VALID_ORGANISER, contactName: "" },
    });

    expect(response.status).toBe(422);
    expect(problemDetailSchema.parse(await response.json()).errors).toEqual([
      { field: "contactName", code: "required" },
    ]);
    const draft = draftResponseSchema.parse(await (await getDraft(token)).json());
    expect(draft.steps.organiser.data).toBeNull();
  });
});

describe("draft-application: Save a step to continue later", () => {
  test("API saves an incomplete step for later", async () => {
    const { createDraft, saveStep } = setup();
    const token = await createDraft();

    const response = await saveStep(token, "organiser", {
      intent: "later",
      data: { organiserType: null, contactName: "", email: "sanne@example.org" },
    });

    expect(response.status).toBe(200);
    const draft = draftResponseSchema.parse(await response.json());
    expect(draft.steps.organiser.data).toMatchObject({ email: "sanne@example.org" });
    expect(draft.steps.organiser.isComplete).toBe(false);
  });
});

describe("draft-application: Drafts are kept for 30 days without saving", () => {
  test("draft not saved for more than 30 days is deleted", async () => {
    const { repository, createDraft, saveStep, getDraft } = setup();
    const token = await createDraft();
    await saveStep(token, "organiser", { intent: "later", data: {} });

    deleteExpiredDrafts(repository, new Date(START.getTime() + 30 * DAY_MS + 60_000));

    const deleted = await getDraft(token);
    const unknown = await getDraft("A".repeat(43));
    expect(deleted.status).toBe(404);
    expect(await deleted.text()).toBe(await unknown.text());
  });

  test("draft saved within 30 days is kept", async () => {
    const { repository, setNow, createDraft, saveStep, getDraft } = setup();
    const token = await createDraft();
    setNow(new Date(START.getTime() + 30 * DAY_MS));
    await saveStep(token, "organiser", { intent: "later", data: {} });
    const today = new Date(START.getTime() + 40 * DAY_MS);
    setNow(today);
    await getDraft(token);

    expect(deleteExpiredDrafts(repository, today)).toBe(0);
    expect((await getDraft(token)).status).toBe(200);
  });

  test("expired draft is refused before the cleanup runs", async () => {
    const { setNow, createDraft, saveStep, getDraft } = setup();
    const token = await createDraft();
    await saveStep(token, "organiser", { intent: "later", data: {} });
    setNow(new Date(START.getTime() + 30 * DAY_MS + 60_000));

    const expired = await getDraft(token);
    const save = await saveStep(token, "organiser", { intent: "later", data: {} });
    const unknown = await getDraft("A".repeat(43));
    expect(expired.status).toBe(404);
    expect(await expired.text()).toBe(await unknown.text());
    expect(save.status).toBe(404);
  });
});

describe("application repository", () => {
  test("creates, finds by hash and saves a step", () => {
    const repository = makeApplicationRepository(new DatabaseSync(":memory:"));
    const id = "6f1c2a8e-3b4d-4e5f-8a9b-0c1d2e3f4a5b" as ApplicationId;

    repository.create(id, "hash-1", START);
    expect(repository.findByTokenHash("hash-1")).toMatchObject({
      id,
      organiser: null,
      event: null,
    });
    expect(repository.findByTokenHash("other")).toBeUndefined();

    const later = new Date(START.getTime() + 60_000);
    const saved = repository.saveStep(id, "organiser", VALID_ORGANISER, later);
    expect(saved.organiser).toEqual(VALID_ORGANISER);
    expect(saved.updatedAt).toBe(later.toISOString());
  });

  test("stored data that no longer fits the schema counts as empty", () => {
    const db = new DatabaseSync(":memory:");
    const repository = makeApplicationRepository(db);
    const id = "6f1c2a8e-3b4d-4e5f-8a9b-0c1d2e3f4a5b" as ApplicationId;
    repository.create(id, "hash-1", START);
    db.prepare("UPDATE applications SET organiser = ?").run(JSON.stringify({ email: 42 }));

    expect(repository.findByTokenHash("hash-1")?.organiser).toBeNull();
  });
});
