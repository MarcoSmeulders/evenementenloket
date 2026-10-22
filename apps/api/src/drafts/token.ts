import { createHash, randomBytes } from "node:crypto";
import type { AccessToken } from "@evenementenloket/schema";

/** 32 random bytes (256 bits), base64url: 43 characters that are safe in a URL. */
export function createAccessToken(): AccessToken {
  return randomBytes(32).toString("base64url") as AccessToken;
}

/** Only this hash is stored, so a copy of the database opens no draft. */
export function makeTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
