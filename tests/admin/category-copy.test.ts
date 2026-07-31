import assert from "node:assert/strict";
import test from "node:test";

import { formatIssueReferenceCount } from "@/lib/admin/category-copy";

test("formats one issue reference in Finnish singular", () => {
  assert.equal(formatIssueReferenceCount(1), "1 ilmoitusviite");
});

test("formats every other issue-reference count in Finnish partitive", () => {
  assert.equal(formatIssueReferenceCount(0), "0 ilmoitusviitettä");
  assert.equal(formatIssueReferenceCount(2), "2 ilmoitusviitettä");
});
