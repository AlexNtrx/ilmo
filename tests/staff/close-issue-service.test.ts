import assert from "node:assert/strict";
import test from "node:test";

import type { IssueStatus } from "@/generated/prisma/enums";
import {
  createCloseIssueService,
  type StaffIssueStore,
} from "@/lib/staff/service";
import type { CloseIssueTarget } from "@/lib/staff/types";

type History = {
  issueId: number;
  targetStatus: CloseIssueTarget;
  actorId: string;
  changedAt: Date;
};

class MemoryStore implements StaffIssueStore {
  statuses = new Map<number, IssueStatus>();
  histories: History[] = [];
  failHistory = false;

  async transaction<T>(
    operation: Parameters<StaffIssueStore["transaction"]>[0],
  ): Promise<T> {
    const statuses = new Map(this.statuses);
    const histories = [...this.histories];

    const result = await operation({
      async updateOpenIssue({ issueId, targetStatus }) {
        if (statuses.get(issueId) !== "OPEN") {
          return false;
        }
        statuses.set(issueId, targetStatus);
        return true;
      },
      async getIssueStatus(issueId) {
        return statuses.get(issueId) ?? null;
      },
      createStatusHistory: async (input) => {
        if (this.failHistory) {
          throw new Error("history failed");
        }
        histories.push(input);
      },
    });

    this.statuses = statuses;
    this.histories = histories;
    return result as T;
  }
}

for (const targetStatus of ["RESOLVED", "INVALID"] as const) {
  test(`closes an OPEN Issue as ${targetStatus} with its actor history`, async () => {
    const store = new MemoryStore();
    const changedAt = new Date("2026-07-31T10:00:00.000Z");
    store.statuses.set(7, "OPEN");
    const closeIssue = createCloseIssueService({
      store,
      now: () => changedAt,
    });

    const result = await closeIssue({
      issueId: 7,
      targetStatus,
      actorId: "staff-1",
    });

    assert.deepEqual(result, {
      status: "SUCCESS",
      issueId: 7,
      targetStatus,
    });
    assert.equal(store.statuses.get(7), targetStatus);
    assert.deepEqual(store.histories, [
      {
        issueId: 7,
        targetStatus,
        actorId: "staff-1",
        changedAt,
      },
    ]);
  });
}

test("does not append history when the Issue is already closed", async () => {
  const store = new MemoryStore();
  store.statuses.set(7, "RESOLVED");
  const closeIssue = createCloseIssueService({ store });

  assert.deepEqual(
    await closeIssue({
      issueId: 7,
      targetStatus: "INVALID",
      actorId: "staff-1",
    }),
    { status: "ALREADY_CLOSED", currentStatus: "RESOLVED" },
  );
  assert.deepEqual(store.histories, []);
});

test("returns NOT_FOUND without writing history", async () => {
  const store = new MemoryStore();
  const closeIssue = createCloseIssueService({ store });

  assert.deepEqual(
    await closeIssue({
      issueId: 404,
      targetStatus: "RESOLVED",
      actorId: "staff-1",
    }),
    { status: "NOT_FOUND" },
  );
  assert.deepEqual(store.histories, []);
});

test("rolls back the status when history creation fails", async () => {
  const store = new MemoryStore();
  store.statuses.set(7, "OPEN");
  store.failHistory = true;
  const closeIssue = createCloseIssueService({ store });

  await assert.rejects(
    closeIssue({
      issueId: 7,
      targetStatus: "RESOLVED",
      actorId: "staff-1",
    }),
    /history failed/,
  );
  assert.equal(store.statuses.get(7), "OPEN");
  assert.deepEqual(store.histories, []);
});
