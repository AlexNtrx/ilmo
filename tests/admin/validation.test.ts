import assert from "node:assert/strict";
import test from "node:test";

import { changeUserRoleSchema, createUserSchema } from "@/lib/admin/validation";

test("accepts only one scalar admin or staff role", () => {
  assert.equal(
    changeUserRoleSchema.safeParse({ userId: "u1", role: "staff" }).success,
    true,
  );
  assert.equal(
    changeUserRoleSchema.safeParse({ userId: "u1", role: ["admin"] }).success,
    false,
  );
  assert.equal(
    changeUserRoleSchema.safeParse({ userId: "u1", role: "admin,staff" })
      .success,
    false,
  );
  assert.equal(
    changeUserRoleSchema.safeParse({ userId: "u1", role: "user" }).success,
    false,
  );
});

test("defaults a newly created user to staff", () => {
  const result = createUserSchema.parse({
    username: "staff.user",
    name: "Staff User",
    password: "password1",
  });
  assert.equal(result.role, "staff");
});

test("matches Better Auth username and password boundaries", () => {
  assert.equal(
    createUserSchema.safeParse({
      username: "ab",
      name: "Name",
      password: "password1",
    }).success,
    false,
  );
  assert.equal(
    createUserSchema.safeParse({
      username: "bad user",
      name: "Name",
      password: "password1",
    }).success,
    false,
  );
  assert.equal(
    createUserSchema.safeParse({
      username: "valid.user",
      name: "Name",
      password: "short",
    }).success,
    false,
  );
});
