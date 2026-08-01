import assert from "node:assert/strict";
import test from "node:test";

import {
  createUserService,
  type AuthenticatedUserAdmin,
  type UserStore,
} from "@/lib/admin/user-service";

function fixture({
  role = "staff",
  admins = 2,
}: { role?: string; admins?: number } = {}) {
  const calls: string[] = [];
  const store: UserStore = {
    findUser: async (id) => ({ id, username: "staff.user", role }),
    countAdmins: async () => admins,
  };
  const userAdmin: AuthenticatedUserAdmin = {
    createUser: async (input) => {
      calls.push(`create:${input.role}:${input.email.endsWith(".invalid")}`);
    },
    updateProfile: async (input) => {
      calls.push(`profile:${String(input.username)}:${input.name}`);
    },
    setRole: async (_id, nextRole) => {
      calls.push(`role:${nextRole}`);
    },
    setPassword: async () => {
      calls.push("password");
    },
    revokeSessions: async () => {
      calls.push("revoke");
    },
    removeUser: async () => {
      calls.push("delete");
    },
  };
  return {
    calls,
    service: createUserService({
      store,
      userAdmin,
      createInternalEmail: () => "opaque@users.ilmo.invalid",
    }),
    userAdmin,
  };
}

test("creates a scalar staff user with an opaque internal email", async () => {
  const { service, calls } = fixture();
  assert.deepEqual(
    await service.create({
      username: "Staff.User",
      name: "Staff",
      password: "password1",
      role: "staff",
    }),
    { status: "SUCCESS" },
  );
  assert.deepEqual(calls, ["create:staff:true"]);
});

test("profile update does not perform a role change", async () => {
  const { service, calls } = fixture();
  assert.deepEqual(
    await service.updateProfile({
      userId: "u1",
      username: "Staff.User",
      name: "New name",
    }),
    { status: "SUCCESS" },
  );
  assert.deepEqual(calls, ["profile:undefined:New name"]);
});

test("prevents demoting the last admin", async () => {
  const { service, calls } = fixture({ role: "admin", admins: 1 });
  assert.deepEqual(await service.changeRole({ userId: "u1", role: "staff" }), {
    status: "LAST_ADMIN",
  });
  assert.deepEqual(calls, []);
});

test("changes only the validated scalar role", async () => {
  const { service, calls } = fixture();
  assert.deepEqual(await service.changeRole({ userId: "u1", role: "admin" }), {
    status: "SUCCESS",
  });
  assert.deepEqual(calls, ["role:admin"]);
});

test("returns SELF_SESSION_REVOKED after self password reset", async () => {
  const { service, calls } = fixture();
  assert.deepEqual(
    await service.resetPassword({
      actorId: "u1",
      userId: "u1",
      password: "password2",
    }),
    { status: "SELF_SESSION_REVOKED" },
  );
  assert.deepEqual(calls, ["password", "revoke"]);
});

test("reports PARTIAL_FAILURE when revocation fails after password update", async () => {
  const fixtureValue = fixture();
  fixtureValue.userAdmin.revokeSessions = async () => {
    fixtureValue.calls.push("revoke-failed");
    throw new Error("failed");
  };
  assert.deepEqual(
    await fixtureValue.service.resetPassword({
      actorId: "admin",
      userId: "u1",
      password: "password2",
    }),
    { status: "PARTIAL_FAILURE" },
  );
  assert.deepEqual(fixtureValue.calls, ["password", "revoke-failed"]);
});

test("prevents self deletion and deletion of the last admin", async () => {
  const self = fixture();
  assert.deepEqual(await self.service.delete({ actorId: "u1", userId: "u1" }), {
    status: "SELF_DELETE",
  });
  const lastAdmin = fixture({ role: "admin", admins: 1 });
  assert.deepEqual(
    await lastAdmin.service.delete({ actorId: "other", userId: "u1" }),
    { status: "LAST_ADMIN" },
  );
  assert.deepEqual(lastAdmin.calls, []);
});
