import assert from "node:assert/strict";
import test from "node:test";

import {
  createIlmoAuthPlugins,
  disabledPublicAuthPaths,
  emailAndPasswordPolicy,
  isExternalAdminAuthPath,
} from "@/lib/auth/config";
import { parseStaffRole } from "@/lib/staff/roles";

test("locks public auth paths and keeps username sign-in configuration", () => {
  assert.deepEqual(disabledPublicAuthPaths, [
    "/sign-up/email",
    "/sign-in/email",
    "/is-username-available",
  ]);
  assert.deepEqual(emailAndPasswordPolicy, {
    enabled: true,
    disableSignUp: true,
  });
});

test("blocks only external Better Auth admin paths", () => {
  assert.equal(isExternalAdminAuthPath("/api/auth/admin/list-users"), true);
  assert.equal(isExternalAdminAuthPath("/api/auth/admin/create-user"), true);
  assert.equal(isExternalAdminAuthPath("/staff/admin/users"), false);
  assert.equal(isExternalAdminAuthPath("/api/auth/sign-in/username"), false);
});

test("preserves username and admin plugins with nextCookies last", () => {
  assert.deepEqual(
    createIlmoAuthPlugins().map((plugin) => plugin.id),
    ["username", "admin", "next-cookies"],
  );
});

test("accepts exactly one scalar admin or staff role", () => {
  assert.equal(parseStaffRole("admin"), "admin");
  assert.equal(parseStaffRole("staff"), "staff");
  assert.equal(parseStaffRole(null), null);
  assert.equal(parseStaffRole(""), null);
  assert.equal(parseStaffRole("admin,staff"), null);
  assert.equal(parseStaffRole(["admin"]), null);
  assert.equal(parseStaffRole("owner"), null);
});
