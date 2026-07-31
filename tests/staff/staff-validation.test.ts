import assert from "node:assert/strict";
import test from "node:test";

import {
  closeIssueSchema,
  staffLoginSchema,
} from "@/lib/staff/validation";

test("validates username/password login without accepting email syntax", () => {
  assert.equal(
    staffLoginSchema.safeParse({
      username: "staff.user",
      password: "temporary password",
    }).success,
    true,
  );
  assert.equal(
    staffLoginSchema.safeParse({
      username: "staff@example.fi",
      password: "temporary password",
    }).success,
    false,
  );
  assert.equal(
    staffLoginSchema.safeParse({ username: "st", password: "" }).success,
    false,
  );
});

test("allows only positive issue IDs and closed target statuses", () => {
  assert.deepEqual(
    closeIssueSchema.parse({ issueId: "12", targetStatus: "RESOLVED" }),
    { issueId: 12, targetStatus: "RESOLVED" },
  );
  assert.equal(
    closeIssueSchema.safeParse({ issueId: "12", targetStatus: "INVALID" })
      .success,
    true,
  );
  assert.equal(
    closeIssueSchema.safeParse({ issueId: "12", targetStatus: "OPEN" })
      .success,
    false,
  );
  assert.equal(
    closeIssueSchema.safeParse({ issueId: "0", targetStatus: "RESOLVED" })
      .success,
    false,
  );
});
