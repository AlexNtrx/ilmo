import assert from "node:assert/strict";
import test from "node:test";

import { createSignOutService } from "@/lib/staff/sign-out";

test("returns SUCCESS after Better Auth sign-out completes", async () => {
  let called = 0;
  const signOut = createSignOutService({
    signOut: async () => {
      called += 1;
    },
  });

  assert.deepEqual(await signOut(), { status: "SUCCESS" });
  assert.equal(called, 1);
});

test("returns a recoverable error when Better Auth sign-out fails", async () => {
  const signOut = createSignOutService({
    signOut: async () => {
      throw new Error("failed");
    },
  });

  assert.deepEqual(await signOut(), {
    status: "SERVER_ERROR",
    message: "Uloskirjautuminen epäonnistui. Yritä uudelleen.",
  });
});
