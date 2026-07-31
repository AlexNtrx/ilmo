import assert from "node:assert/strict";
import test from "node:test";

import {
  getCloseIssueSuccessMessage,
  getCloseIssueRevalidationPaths,
  getSignOutSuccessMessage,
  isSuccessfulCloseAction,
} from "@/lib/staff/action-policy";
import type { CloseIssueActionResult } from "@/lib/staff/types";

test("revalidates the dashboard and affected Issue detail", () => {
  assert.deepEqual(getCloseIssueRevalidationPaths(42), [
    "/staff",
    "/staff/issues/42",
  ]);
});

test("shows logout success feedback only after confirmed sign-out", () => {
  assert.equal(
    getSignOutSuccessMessage({ status: "SUCCESS" }),
    "Olet kirjautunut ulos.",
  );
  assert.equal(
    getSignOutSuccessMessage({
      status: "SERVER_ERROR",
      message: "failed",
    }),
    null,
  );
});

test("allows success feedback only for confirmed transaction success", () => {
  const resolved: CloseIssueActionResult = {
    status: "SUCCESS",
    issueId: 42,
    targetStatus: "RESOLVED",
  };
  const invalid: CloseIssueActionResult = {
    status: "SUCCESS",
    issueId: 43,
    targetStatus: "INVALID",
  };
  const results: CloseIssueActionResult[] = [
    { status: "SESSION_EXPIRED", message: "expired" },
    { status: "UNAUTHORIZED", message: "unauthorized" },
    { status: "ALREADY_CLOSED", message: "closed" },
    { status: "SERVER_ERROR", message: "failed" },
  ];

  assert.equal(isSuccessfulCloseAction(resolved), true);
  assert.equal(
    getCloseIssueSuccessMessage(resolved),
    "Ongelma on merkitty ratkaistuksi.",
  );
  assert.equal(
    getCloseIssueSuccessMessage(invalid),
    "Ilmoitus on merkitty virheelliseksi.",
  );
  assert.deepEqual(results.map(isSuccessfulCloseAction), [
    false,
    false,
    false,
    false,
  ]);
  assert.deepEqual(results.map(getCloseIssueSuccessMessage), [
    null,
    null,
    null,
    null,
  ]);
});
