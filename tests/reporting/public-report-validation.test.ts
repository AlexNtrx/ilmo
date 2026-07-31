import assert from "node:assert/strict";
import test from "node:test";

import { PublicReportError } from "../../lib/reporting/errors";
import { parsePublicReportPayload } from "../../lib/reporting/validation";

test("normalizes category IDs and the shared description", () => {
  assert.deepEqual(
    parsePublicReportPayload({
      categoryIds: [4, 2, 4],
      description: "  Ovi ei sulkeudu.  ",
    }),
    {
      categoryIds: [2, 4],
      description: "Ovi ei sulkeudu.",
    },
  );
});

test("converts an empty shared description to null", () => {
  assert.deepEqual(
    parsePublicReportPayload({
      categoryIds: [1],
      description: "   ",
    }),
    {
      categoryIds: [1],
      description: null,
    },
  );
});

test("rejects an empty selection and descriptions over 200 characters", () => {
  assert.throws(
    () =>
      parsePublicReportPayload({
        categoryIds: [],
        description: "x".repeat(201),
      }),
    (error) => {
      assert.ok(error instanceof PublicReportError);
      assert.equal(error.code, "VALIDATION_ERROR");
      assert.ok(error.fieldErrors.categoryIds);
      assert.ok(error.fieldErrors.description);
      return true;
    },
  );
});
