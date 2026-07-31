import assert from "node:assert/strict";
import test from "node:test";

import { PublicReportError } from "../../lib/reporting/errors";
import {
  createPublicReportService,
  type CreateIssueInput,
  type MergeIssueInput,
  type ReportingCategoryRecord,
  type ReportingOpenIssueRecord,
  type ReportingStore,
  type ReportingTransaction,
} from "../../lib/reporting/service";

type FakeConfirmation = {
  description: string | null;
  createdAt: Date;
};

type FakeIssue = {
  id: number;
  locationId: number;
  categoryId: number;
  description: string | null;
  priority: "NORMAL" | "HIGH" | "URGENT";
  firstReportedAt: Date;
  lastConfirmedAt: Date;
  confirmations: FakeConfirmation[];
  history: Array<{
    fromStatus: null;
    toStatus: "OPEN";
    changeSource: "SYSTEM";
  }>;
};

type FakeState = {
  submissions: Array<{
    sourceHash: string;
    payloadHash: string;
    createdAt: Date;
  }>;
  issues: FakeIssue[];
};

const NOW = new Date("2026-07-31T08:00:00.000Z");
const location = { id: 7, isActive: true };
const standardCategory = {
  id: 10,
  isUrgent: false,
  mergeMode: "MERGE_OPEN",
  requiresDescription: false,
} satisfies ReportingCategoryRecord;
const requiredCategory = {
  id: 20,
  isUrgent: false,
  mergeMode: "MERGE_OPEN",
  requiresDescription: true,
} satisfies ReportingCategoryRecord;
const urgentCategory = {
  id: 30,
  isUrgent: true,
  mergeMode: "MERGE_OPEN",
  requiresDescription: true,
} satisfies ReportingCategoryRecord;
const alwaysCreateCategory = {
  id: 40,
  isUrgent: false,
  mergeMode: "ALWAYS_CREATE",
  requiresDescription: false,
} satisfies ReportingCategoryRecord;

class InMemoryReportingStore implements ReportingStore {
  state: FakeState = { submissions: [], issues: [] };
  transactionAttempts = 0;
  openIssueReads = 0;
  serializationFailuresRemaining = 0;
  failDuringIssueCreation = false;

  constructor(
    readonly categories: ReportingCategoryRecord[] = [standardCategory],
  ) {}

  async transaction<T>(
    operation: (transaction: ReportingTransaction) => Promise<T>,
  ): Promise<T> {
    this.transactionAttempts += 1;
    const snapshot = structuredClone(this.state);

    try {
      const result = await operation(this.createTransaction());

      if (this.serializationFailuresRemaining > 0) {
        this.serializationFailuresRemaining -= 1;
        throw { code: "P2034" };
      }

      return result;
    } catch (error) {
      this.state = snapshot;
      throw error;
    }
  }

  private createTransaction(): ReportingTransaction {
    return {
      findLocation: async (publicCode) =>
        publicCode === "pilot-wc-001" ? location : null,
      findActiveCategories: async (categoryIds) =>
        this.categories.filter((category) =>
          categoryIds.includes(category.id),
        ),
      deleteExpiredSubmissions: async (before) => {
        this.state.submissions = this.state.submissions.filter(
          (submission) => submission.createdAt >= before,
        );
      },
      countRecentSubmissions: async (sourceHash, since) =>
        this.state.submissions.filter(
          (submission) =>
            submission.sourceHash === sourceHash &&
            submission.createdAt >= since,
        ).length,
      hasRecentDuplicate: async (sourceHash, payloadHash, since) =>
        this.state.submissions.some(
          (submission) =>
            submission.sourceHash === sourceHash &&
            submission.payloadHash === payloadHash &&
            submission.createdAt >= since,
        ),
      createSubmission: async (sourceHash, payloadHash, createdAt) => {
        this.state.submissions.push({
          sourceHash,
          payloadHash,
          createdAt,
        });
      },
      findOpenIssue: async (locationId, categoryId) => {
        this.openIssueReads += 1;
        const issue = this.state.issues.find(
          (candidate) =>
            candidate.locationId === locationId &&
            candidate.categoryId === categoryId,
        );

        return issue
          ? ({
              id: issue.id,
              priority: issue.priority,
              firstReportedAt: issue.firstReportedAt,
              confirmationCount: issue.confirmations.length,
            } satisfies ReportingOpenIssueRecord)
          : null;
      },
      createIssue: async (input) => this.createIssue(input),
      mergeIssue: async (input) => this.mergeIssue(input),
    };
  }

  private async createIssue(input: CreateIssueInput) {
    this.state.issues.push({
      id: this.state.issues.length + 1,
      locationId: input.locationId,
      categoryId: input.categoryId,
      description: input.description,
      priority: input.priority,
      firstReportedAt: input.reportedAt,
      lastConfirmedAt: input.reportedAt,
      confirmations: [
        {
          description: input.description,
          createdAt: input.reportedAt,
        },
      ],
      history: [
        {
          fromStatus: null,
          toStatus: "OPEN",
          changeSource: "SYSTEM",
        },
      ],
    });

    if (this.failDuringIssueCreation) {
      throw new Error("Injected transaction failure.");
    }
  }

  private async mergeIssue(input: MergeIssueInput) {
    const issue = this.state.issues.find(
      (candidate) => candidate.id === input.issueId,
    );

    assert.ok(issue);
    issue.confirmations.push({
      description: input.description,
      createdAt: input.confirmedAt,
    });
    issue.lastConfirmedAt = input.confirmedAt;
    issue.priority = input.priority;
  }
}

function createSubmission(
  store: InMemoryReportingStore,
  categoryIds: number[],
  options: {
    description?: string | null;
    sourceHash?: string;
    payloadHash?: string;
  } = {},
) {
  const submit = createPublicReportService({
    store,
    now: () => NOW,
  });

  return submit({
    publicCode: "pilot-wc-001",
    payload: {
      categoryIds,
      description: options.description ?? null,
    },
    sourceHash: options.sourceHash ?? "source-a",
    payloadHash: options.payloadHash ?? "payload-a",
  });
}

test("creates independent issues with shared descriptions and initial history", async () => {
  const store = new InMemoryReportingStore([
    requiredCategory,
    urgentCategory,
  ]);

  const result = await createSubmission(store, [30, 20], {
    description: "Vettä lattialla.",
  });

  assert.deepEqual(result, { ok: true });
  assert.equal(store.state.issues.length, 2);
  assert.deepEqual(
    store.state.issues.map((issue) => issue.categoryId),
    [20, 30],
  );
  assert.ok(
    store.state.issues.every(
      (issue) =>
        issue.description === "Vettä lattialla." &&
        issue.confirmations[0]?.description === "Vettä lattialla." &&
        issue.history[0]?.fromStatus === null &&
        issue.history[0]?.toStatus === "OPEN",
    ),
  );
  assert.equal(store.state.issues[1]?.priority, "URGENT");
});

test("requires the shared description when any selected category requires it", async () => {
  const store = new InMemoryReportingStore([requiredCategory]);

  await assert.rejects(
    createSubmission(store, [requiredCategory.id]),
    (error) => {
      assert.ok(error instanceof PublicReportError);
      assert.equal(error.code, "VALIDATION_ERROR");
      assert.ok(error.fieldErrors.description);
      return true;
    },
  );
  assert.equal(store.state.submissions.length, 0);
});

test("merges without overwriting the issue description and promotes only NORMAL", async () => {
  const store = new InMemoryReportingStore([
    standardCategory,
    urgentCategory,
  ]);
  store.state.issues = [
    {
      id: 1,
      locationId: location.id,
      categoryId: standardCategory.id,
      description: "Alkuperäinen kuvaus",
      priority: "NORMAL",
      firstReportedAt: new Date(NOW.getTime() - 30 * 60 * 1000),
      lastConfirmedAt: NOW,
      confirmations: Array.from({ length: 4 }, () => ({
        description: null,
        createdAt: NOW,
      })),
      history: [],
    },
    {
      id: 2,
      locationId: location.id,
      categoryId: urgentCategory.id,
      description: "Vaara",
      priority: "URGENT",
      firstReportedAt: new Date(NOW.getTime() - 3 * 60 * 60 * 1000),
      lastConfirmedAt: NOW,
      confirmations: [],
      history: [],
    },
  ];

  await createSubmission(store, [standardCategory.id, urgentCategory.id], {
    description: "Uusi havainto",
  });

  assert.equal(store.state.issues[0]?.description, "Alkuperäinen kuvaus");
  assert.equal(
    store.state.issues[0]?.confirmations.at(-1)?.description,
    "Uusi havainto",
  );
  assert.equal(store.state.issues[0]?.priority, "HIGH");
  assert.equal(store.state.issues[1]?.priority, "URGENT");
});

test("ALWAYS_CREATE creates a new issue for every accepted submission", async () => {
  const store = new InMemoryReportingStore([alwaysCreateCategory]);

  await createSubmission(store, [alwaysCreateCategory.id], {
    payloadHash: "payload-1",
  });
  await createSubmission(store, [alwaysCreateCategory.id], {
    payloadHash: "payload-2",
  });

  assert.equal(store.state.issues.length, 2);
});

test("rolls back the ledger and issue records when creation fails", async () => {
  const store = new InMemoryReportingStore([standardCategory]);
  store.failDuringIssueCreation = true;

  await assert.rejects(createSubmission(store, [standardCategory.id]));
  assert.deepEqual(store.state, { submissions: [], issues: [] });
});

test("returns the same neutral result for a duplicate without another issue", async () => {
  const store = new InMemoryReportingStore([standardCategory]);

  const first = await createSubmission(store, [standardCategory.id]);
  const duplicate = await createSubmission(store, [standardCategory.id]);

  assert.deepEqual(first, { ok: true });
  assert.deepEqual(duplicate, { ok: true });
  assert.equal(store.state.issues.length, 1);
  assert.equal(store.state.issues[0]?.confirmations.length, 1);
  assert.equal(store.state.submissions.length, 2);
});

test("allows five submissions in ten minutes and rejects the sixth", async () => {
  const store = new InMemoryReportingStore([alwaysCreateCategory]);

  for (let index = 0; index < 5; index += 1) {
    await createSubmission(store, [alwaysCreateCategory.id], {
      payloadHash: `payload-${index}`,
    });
  }

  await assert.rejects(
    createSubmission(store, [alwaysCreateCategory.id], {
      payloadHash: "payload-6",
    }),
    (error) => {
      assert.ok(error instanceof PublicReportError);
      assert.equal(error.code, "RATE_LIMITED");
      return true;
    },
  );
  assert.equal(store.state.submissions.length, 5);
});

test("retries P2034 at most twice and re-reads the OPEN issue each time", async () => {
  const store = new InMemoryReportingStore([standardCategory]);
  store.serializationFailuresRemaining = 2;

  const result = await createSubmission(store, [standardCategory.id]);

  assert.deepEqual(result, { ok: true });
  assert.equal(store.transactionAttempts, 3);
  assert.equal(store.openIssueReads, 3);
  assert.equal(store.state.issues.length, 1);
});

test("stops after two Serializable retries", async () => {
  const store = new InMemoryReportingStore([standardCategory]);
  store.serializationFailuresRemaining = 3;

  await assert.rejects(createSubmission(store, [standardCategory.id]), {
    code: "P2034",
  });
  assert.equal(store.transactionAttempts, 3);
  assert.equal(store.openIssueReads, 3);
  assert.deepEqual(store.state, { submissions: [], issues: [] });
});

test("does not retry an unknown transaction error", async () => {
  const store = new InMemoryReportingStore([standardCategory]);
  store.failDuringIssueCreation = true;

  await assert.rejects(createSubmission(store, [standardCategory.id]));
  assert.equal(store.transactionAttempts, 1);
});
