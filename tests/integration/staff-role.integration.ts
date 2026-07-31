import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const baseUrl =
  process.env.ILMO_INTEGRATION_BASE_URL ??
  process.env.BETTER_AUTH_URL ??
  "http://localhost:3000";
const adminUsername =
  process.env.ILMO_INTEGRATION_ADMIN_USERNAME ??
  process.env.ILMO_SEED_ADMIN_USERNAME;
const adminPassword =
  process.env.ILMO_INTEGRATION_ADMIN_PASSWORD ??
  process.env.ILMO_SEED_ADMIN_PASSWORD;
let integrationStage = "environment validation";

function cookieHeader(response: Response) {
  const values = (
    response.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie?.() ?? [response.headers.get("set-cookie") ?? ""];
  const cookie = values
    .filter(Boolean)
    .map((value) => value.split(";", 1)[0])
    .join("; ");
  assert.ok(cookie, "Expected an authenticated session cookie.");
  return cookie;
}

async function signIn(username: string, password: string) {
  const response = await fetch(`${baseUrl}/api/auth/sign-in/username`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
    redirect: "manual",
  });
  assert.equal(response.status, 200, "Username sign-in must succeed.");
  return new Headers({ cookie: cookieHeader(response) });
}

async function main() {
  if (!baseUrl || !adminUsername || !adminPassword) {
    console.log(
      "NOT RUN: authenticated staff-role integration environment is unavailable.",
    );
    return;
  }

  integrationStage = "admin sign-in";
  const adminHeaders = await signIn(adminUsername, adminPassword);
  integrationStage = "admin session verification";
  const adminSession = await auth.api.getSession({ headers: adminHeaders });
  assert.equal(
    (adminSession?.user as { role?: unknown } | undefined)?.role,
    "admin",
    "Fixture must be an admin.",
  );

  integrationStage = "external Admin-plugin route protection";
  for (const request of [
    new Request(`${baseUrl}/api/auth/admin/list-users`, { method: "GET" }),
    new Request(`${baseUrl}/api/auth/admin/create-user`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }),
  ]) {
    const response = await fetch(request);
    assert.equal(
      response.status,
      404,
      "External Admin-plugin paths must be unavailable.",
    );
  }

  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const username = `vs03_${suffix}`;
  const password = `${randomUUID()}Aa1!`;
  let createdUserId: string | null = null;

  try {
    integrationStage = "temporary staff creation";
    const createdUser = await auth.api.createUser({
      headers: adminHeaders,
      body: {
        email: `${randomUUID()}@users.ilmo.invalid`,
        password,
        name: "VS-03 Integration User",
        role: "staff",
        data: { username, displayUsername: username },
      },
    });
    createdUserId = createdUser.user.id;

    integrationStage = "temporary staff sign-in";
    const staffHeaders = await signIn(username, password);
    integrationStage = "staff session role verification";
    const staffSession = await auth.api.getSession({ headers: staffHeaders });
    assert.equal(
      (staffSession?.user as { role?: unknown } | undefined)?.role,
      "staff",
    );

    integrationStage = "staff dashboard access";
    const staffPage = await fetch(`${baseUrl}/staff`, {
      headers: staffHeaders,
      redirect: "manual",
    });
    assert.equal(staffPage.status, 200, "Staff must access /staff.");

    integrationStage = "staff admin-page rejection";
    for (const path of ["/staff/admin/categories", "/staff/admin/users"]) {
      const response: Response = await fetch(`${baseUrl}${path}`, {
        headers: staffHeaders,
        redirect: "manual",
      });
      const body = await response.text();
      const deniedByRedirect =
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.get("location") === "/staff/unauthorized";
      const deniedByStreamedPage =
        response.status === 200 &&
        (body.includes("Kirjautumiseen") ||
          body.includes("/staff/unauthorized"));
      const renderedAdminContent =
        body.includes("Luo käyttäjä") || body.includes("Luo uusi luokka");
      assert.ok(
        (deniedByRedirect || deniedByStreamedPage) && !renderedAdminContent,
        `Staff admin-page access must be denied (status ${response.status}, unauthorized ${deniedByStreamedPage}, admin content ${renderedAdminContent}).`,
      );
    }

    integrationStage = "staff admin-operation rejection";
    await assert.rejects(
      auth.api.setRole({
        headers: staffHeaders,
        body: { userId: createdUserId, role: "admin" },
      }),
      "Staff must not invoke Admin-plugin role management.",
    );

    console.log("PASSED: authenticated staff-role integration verification.");
  } finally {
    if (createdUserId) {
      const failedStage = integrationStage;
      try {
        await auth.api.removeUser({
          headers: adminHeaders,
          body: { userId: createdUserId },
        });
      } catch (error) {
        integrationStage = "temporary staff cleanup";
        throw error;
      }
      integrationStage = failedStage;
    }
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  const reason = error instanceof Error ? error.message : "Unknown error";
  console.error(
    `FAILED at ${integrationStage}: authenticated staff-role integration verification. ${reason}`,
  );
  process.exitCode = 1;
});
