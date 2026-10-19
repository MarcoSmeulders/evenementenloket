import { describe, expect, test } from "vitest";
import { errorsOf } from "./testUtils";
import { organiserDraftSchema, organiserSchema } from "./organiser";

const COMPLETE = {
  organiserType: "organisation",
  organisationName: "Bewonersvereniging Kastanjelaan",
  contactName: "Sanne de Vries",
  email: "sanne@example.org",
  phone: "",
};

describe("draft-application: Organiser step", () => {
  test("complete organiser step", () => {
    expect(organiserSchema.safeParse(COMPLETE).success).toBe(true);
    expect(
      organiserSchema.safeParse({ ...COMPLETE, organiserType: "private", organisationName: "" })
        .success,
    ).toBe(true);
  });

  test("invalid e-mail address", () => {
    const result = organiserSchema.safeParse({ ...COMPLETE, email: "sanne@" });
    expect(result.success).toBe(false);
    expect(errorsOf(result)).toEqual([{ field: "email", code: "invalid_email" }]);
  });
});

describe("organiser schemas", () => {
  test("a draft may leave required fields empty", () => {
    const result = organiserDraftSchema.safeParse({
      organiserType: null,
      contactName: "",
      email: "sanne@example.org",
    });
    expect(result.success).toBe(true);
  });

  test("a draft still checks the format of what is filled in", () => {
    const result = organiserDraftSchema.safeParse({ email: "sanne@", phone: "abc" });
    expect(errorsOf(result)).toEqual([
      { field: "email", code: "invalid_email" },
      { field: "phone", code: "invalid_phone" },
    ]);
  });

  test("a complete step reports every missing field as required", () => {
    const result = organiserSchema.safeParse({ organiserType: null, contactName: "", email: "" });
    expect(errorsOf(result)).toEqual([
      { field: "organiserType", code: "required" },
      { field: "contactName", code: "required" },
      { field: "email", code: "required" },
    ]);
  });

  test("an organisation needs an organisation name", () => {
    const result = organiserSchema.safeParse({ ...COMPLETE, organisationName: " " });
    expect(errorsOf(result)).toEqual([{ field: "organisationName", code: "required" }]);
  });
});
