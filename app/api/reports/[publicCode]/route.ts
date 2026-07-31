import { NextRequest, NextResponse } from "next/server";

import { PublicReportError } from "@/lib/reporting/errors";
import {
  createPayloadHash,
  createReporterToken,
  createSourceHash,
  getReportProtectionSecret,
  isReporterToken,
  REPORTER_COOKIE_MAX_AGE_SECONDS,
  REPORTER_COOKIE_NAME,
} from "@/lib/reporting/protection";
import { submitPublicReport } from "@/lib/reporting/runtime";
import { parsePublicReportPayload } from "@/lib/reporting/validation";

type RouteParameters = {
  params: Promise<{ publicCode: string }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteParameters,
) {
  const currentToken = request.cookies.get(REPORTER_COOKIE_NAME)?.value;
  const reporterToken = isReporterToken(currentToken)
    ? currentToken
    : createReporterToken();
  const shouldSetCookie = reporterToken !== currentToken;

  try {
    const { publicCode } = await params;
    const requestBody = await readJsonBody(request);
    const payload = parsePublicReportPayload(requestBody);
    const secret = getReportProtectionSecret();
    const sourceHash = createSourceHash(reporterToken, secret);
    const payloadHash = createPayloadHash(publicCode, payload, secret);

    await submitPublicReport({
      publicCode,
      payload,
      sourceHash,
      payloadHash,
    });

    return withReporterCookie(
      NextResponse.json(
        { ok: true },
        { headers: { "Cache-Control": "no-store" } },
      ),
      reporterToken,
      shouldSetCookie,
    );
  } catch (error) {
    if (error instanceof PublicReportError) {
      return withReporterCookie(
        NextResponse.json(
          {
            ok: false,
            error: {
              code: error.code,
              message: error.message,
              fieldErrors: error.fieldErrors,
            },
          },
          {
            status: getErrorStatus(error),
            headers: { "Cache-Control": "no-store" },
          },
        ),
        reporterToken,
        shouldSetCookie,
      );
    }

    console.error("Public report submission failed.", error);

    return withReporterCookie(
      NextResponse.json(
        {
          ok: false,
          error: {
            code: "SERVER_ERROR",
            message:
              "Ilmoituksen lähettäminen ei onnistunut. Yritä hetken kuluttua uudelleen.",
          },
        },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        },
      ),
      reporterToken,
      shouldSetCookie,
    );
  }
}

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    throw new PublicReportError(
      "VALIDATION_ERROR",
      "Ilmoituksen tietoja ei voitu lukea.",
    );
  }
}

function getErrorStatus(error: PublicReportError) {
  switch (error.code) {
    case "INVALID_LOCATION":
      return 404;
    case "INACTIVE_LOCATION":
      return 410;
    case "RATE_LIMITED":
      return 429;
    case "VALIDATION_ERROR":
      return 400;
  }
}

function withReporterCookie(
  response: NextResponse,
  reporterToken: string,
  shouldSetCookie: boolean,
) {
  if (shouldSetCookie) {
    response.cookies.set({
      name: REPORTER_COOKIE_NAME,
      value: reporterToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: REPORTER_COOKIE_MAX_AGE_SECONDS,
    });
  }

  return response;
}
