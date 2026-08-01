import { createHmac, randomBytes } from "node:crypto";

import type { NormalizedPublicReportPayload } from "@/lib/reporting/validation";

export const REPORTER_COOKIE_NAME = "ilmo_reporter";
export const REPORTER_COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60;

/** Creates an opaque identifier used by the temporary reporting protection layer. */
export function createReporterToken() {
  return randomBytes(32).toString("base64url");
}

/** Checks whether a supplied reporter identifier has the expected safe shape. */
export function isReporterToken(value: string | undefined): value is string {
  return Boolean(value && /^[A-Za-z0-9_-]{43}$/.test(value));
}

/** Derives a non-reversible source identifier for temporary protection records. */
export function createSourceHash(token: string, secret: string) {
  return createProtectionHash(`source:v1:${token}`, secret);
}

/** Derives a stable fingerprint for one normalized public submission. */
export function createPayloadHash(
  publicCode: string,
  payload: NormalizedPublicReportPayload,
  secret: string,
) {
  return createProtectionHash(
    JSON.stringify({
      publicCode,
      categoryIds: payload.categoryIds,
      description: payload.description,
    }),
    secret,
  );
}

/** Returns the server-only protection secret or fails before accepting reports. */
export function getReportProtectionSecret() {
  const secret = process.env.ILMO_REPORT_PROTECTION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ILMO_REPORT_PROTECTION_SECRET must contain at least 32 characters.",
    );
  }

  return secret;
}

function createProtectionHash(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}
