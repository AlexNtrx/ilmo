import assert from "node:assert/strict";
import test from "node:test";

import {
  buildStaffDashboard,
  selectTopLocation,
  type DashboardIssueRecord,
} from "@/lib/staff/dashboard";

function issue(
  overrides: Partial<DashboardIssueRecord> & Pick<DashboardIssueRecord, "id">,
): DashboardIssueRecord {
  return {
    id: overrides.id,
    priority: "NORMAL",
    status: "OPEN",
    firstReportedAt: new Date("2026-07-31T08:00:00.000Z"),
    location: { id: 1, nameFi: "Keskusta" },
    category: { nameFi: "Muu ongelma" },
    confirmationCount: 1,
    ...overrides,
  };
}

test("orders open issues by priority, age, and id", () => {
  const dashboard = buildStaffDashboard([
    issue({ id: 5, priority: "NORMAL" }),
    issue({ id: 4, priority: "URGENT" }),
    issue({
      id: 3,
      priority: "HIGH",
      firstReportedAt: new Date("2026-07-31T09:00:00.000Z"),
    }),
    issue({
      id: 2,
      priority: "HIGH",
      firstReportedAt: new Date("2026-07-31T07:00:00.000Z"),
    }),
    issue({
      id: 1,
      priority: "HIGH",
      firstReportedAt: new Date("2026-07-31T07:00:00.000Z"),
    }),
  ]);

  assert.deepEqual(
    dashboard.issues.map((item) => item.id),
    [4, 1, 2, 3, 5],
  );
  assert.equal(dashboard.openCount, 5);
  assert.equal(dashboard.urgentCount, 1);
});

test("selects top Location by confirmations, Finnish name, then id", () => {
  const byName = buildStaffDashboard([
    issue({
      id: 1,
      location: { id: 8, nameFi: "Öinen WC" },
      confirmationCount: 3,
    }),
    issue({
      id: 2,
      location: { id: 4, nameFi: "Aulan WC" },
      confirmationCount: 3,
    }),
  ]);
  assert.equal(byName.topLocationNameFi, "Aulan WC");

  const byId = buildStaffDashboard([
    issue({
      id: 1,
      location: { id: 8, nameFi: "Aulan WC" },
      confirmationCount: 3,
    }),
    issue({
      id: 2,
      location: { id: 4, nameFi: "Aulan WC" },
      confirmationCount: 3,
    }),
  ]);
  assert.equal(byId.topLocationNameFi, "Aulan WC");
  assert.equal(
    selectTopLocation([
      { id: 8, nameFi: "Aulan WC", confirmations: 3 },
      { id: 4, nameFi: "Aulan WC", confirmations: 3 },
    ])?.id,
    4,
  );
});

test("returns null top Location for an empty dashboard", () => {
  assert.deepEqual(buildStaffDashboard([]), {
    issues: [],
    openCount: 0,
    urgentCount: 0,
    topLocationNameFi: null,
  });
});
