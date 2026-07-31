import type {
  IssueMergeMode,
  IssuePriority,
} from "@/generated/prisma/enums";
import {
  PublicReportError,
  type PublicReportFieldErrors,
} from "@/lib/reporting/errors";
import type { NormalizedPublicReportPayload } from "@/lib/reporting/validation";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 5;
const DUPLICATE_WINDOW_MS = 60 * 1000;
const LEDGER_RETENTION_MS = 24 * 60 * 60 * 1000;
const HIGH_PRIORITY_AGE_MS = 2 * 60 * 60 * 1000;
const HIGH_PRIORITY_CONFIRMATIONS = 5;
const MAX_SERIALIZABLE_RETRIES = 2;

export type ReportingLocationRecord = {
  id: number;
  isActive: boolean;
};

export type ReportingCategoryRecord = {
  id: number;
  isUrgent: boolean;
  mergeMode: IssueMergeMode;
  requiresDescription: boolean;
};

export type ReportingOpenIssueRecord = {
  id: number;
  priority: IssuePriority;
  firstReportedAt: Date;
  confirmationCount: number;
};

export type CreateIssueInput = {
  locationId: number;
  categoryId: number;
  description: string | null;
  priority: IssuePriority;
  reportedAt: Date;
};

export type MergeIssueInput = {
  issueId: number;
  description: string | null;
  priority: IssuePriority;
  confirmedAt: Date;
};

export interface ReportingTransaction {
  findLocation(publicCode: string): Promise<ReportingLocationRecord | null>;
  findActiveCategories(categoryIds: number[]): Promise<ReportingCategoryRecord[]>;
  deleteExpiredSubmissions(before: Date): Promise<void>;
  countRecentSubmissions(sourceHash: string, since: Date): Promise<number>;
  hasRecentDuplicate(
    sourceHash: string,
    payloadHash: string,
    since: Date,
  ): Promise<boolean>;
  createSubmission(
    sourceHash: string,
    payloadHash: string,
    createdAt: Date,
  ): Promise<void>;
  findOpenIssue(
    locationId: number,
    categoryId: number,
  ): Promise<ReportingOpenIssueRecord | null>;
  createIssue(input: CreateIssueInput): Promise<void>;
  mergeIssue(input: MergeIssueInput): Promise<void>;
}

export interface ReportingStore {
  transaction<T>(
    operation: (transaction: ReportingTransaction) => Promise<T>,
  ): Promise<T>;
}

export type SubmitPublicReportInput = {
  publicCode: string;
  payload: NormalizedPublicReportPayload;
  sourceHash: string;
  payloadHash: string;
};

export type SubmitPublicReportResult = {
  ok: true;
};

export type PublicReportServiceDependencies = {
  store: ReportingStore;
  now?: () => Date;
  isSerializationConflict?: (error: unknown) => boolean;
};

export function createPublicReportService({
  store,
  now = () => new Date(),
  isSerializationConflict = isPrismaSerializationConflict,
}: PublicReportServiceDependencies) {
  return async function submitPublicReport(
    input: SubmitPublicReportInput,
  ): Promise<SubmitPublicReportResult> {
    for (let attempt = 0; attempt <= MAX_SERIALIZABLE_RETRIES; attempt += 1) {
      try {
        return await store.transaction((transaction) =>
          processPublicReport(transaction, input, now()),
        );
      } catch (error) {
        const canRetry =
          isSerializationConflict(error) &&
          attempt < MAX_SERIALIZABLE_RETRIES;

        if (!canRetry) {
          throw error;
        }
      }
    }

    throw new Error("The Serializable retry loop ended unexpectedly.");
  };
}

export function isPrismaSerializationConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  );
}

async function processPublicReport(
  transaction: ReportingTransaction,
  input: SubmitPublicReportInput,
  now: Date,
): Promise<SubmitPublicReportResult> {
  const selectedCategoryIds = [...new Set(input.payload.categoryIds)].sort(
    (left, right) => left - right,
  );
  const location = await transaction.findLocation(input.publicCode);

  if (!location) {
    throw new PublicReportError(
      "INVALID_LOCATION",
      "Ilmoituspaikkaa ei löytynyt.",
    );
  }

  if (!location.isActive) {
    throw new PublicReportError(
      "INACTIVE_LOCATION",
      "Tässä kohteessa ei voi tällä hetkellä tehdä ilmoitusta.",
    );
  }

  const categories = await transaction.findActiveCategories(
    selectedCategoryIds,
  );
  validateSelectedCategories(
    selectedCategoryIds,
    input.payload.description,
    categories,
  );

  await transaction.deleteExpiredSubmissions(
    new Date(now.getTime() - LEDGER_RETENTION_MS),
  );

  const recentSubmissionCount = await transaction.countRecentSubmissions(
    input.sourceHash,
    new Date(now.getTime() - RATE_LIMIT_WINDOW_MS),
  );

  if (recentSubmissionCount >= RATE_LIMIT_MAX_SUBMISSIONS) {
    throw new PublicReportError(
      "RATE_LIMITED",
      "Olet lähettänyt useita ilmoituksia. Odota hetki ja yritä uudelleen.",
    );
  }

  const duplicate = await transaction.hasRecentDuplicate(
    input.sourceHash,
    input.payloadHash,
    new Date(now.getTime() - DUPLICATE_WINDOW_MS),
  );

  await transaction.createSubmission(
    input.sourceHash,
    input.payloadHash,
    now,
  );

  if (duplicate) {
    return { ok: true };
  }

  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );

  for (const categoryId of selectedCategoryIds) {
    const category = categoriesById.get(categoryId);

    if (!category) {
      throw new PublicReportError(
        "VALIDATION_ERROR",
        "Valittu ilmoitustyyppi ei ole enää käytettävissä.",
        { categoryIds: "Päivitä sivu ja valitse ilmoitustyyppi uudelleen." },
      );
    }

    const initialPriority = category.isUrgent ? "URGENT" : "NORMAL";

    if (category.mergeMode === "MERGE_OPEN") {
      const openIssue = await transaction.findOpenIssue(
        location.id,
        category.id,
      );

      if (openIssue) {
        await transaction.mergeIssue({
          issueId: openIssue.id,
          description: input.payload.description,
          priority: getMergedPriority(openIssue, now),
          confirmedAt: now,
        });
        continue;
      }
    }

    await transaction.createIssue({
      locationId: location.id,
      categoryId: category.id,
      description: input.payload.description,
      priority: initialPriority,
      reportedAt: now,
    });
  }

  return { ok: true };
}

function validateSelectedCategories(
  selectedCategoryIds: number[],
  description: string | null,
  categories: ReportingCategoryRecord[],
) {
  const fieldErrors: PublicReportFieldErrors = {};

  if (categories.length !== selectedCategoryIds.length) {
    fieldErrors.categoryIds =
      "Valittu ilmoitustyyppi ei ole enää käytettävissä.";
  }

  if (
    categories.some((category) => category.requiresDescription) &&
    !description
  ) {
    fieldErrors.description =
      "Kerro lyhyesti lisätiedot valitusta ongelmasta.";
  }

  if (fieldErrors.categoryIds || fieldErrors.description) {
    throw new PublicReportError(
      "VALIDATION_ERROR",
      "Tarkista ilmoituksen tiedot.",
      fieldErrors,
    );
  }
}

function getMergedPriority(
  issue: ReportingOpenIssueRecord,
  confirmedAt: Date,
): IssuePriority {
  if (issue.priority !== "NORMAL") {
    return issue.priority;
  }

  const reachesConfirmationThreshold =
    issue.confirmationCount + 1 >= HIGH_PRIORITY_CONFIRMATIONS;
  const reachesAgeThreshold =
    confirmedAt.getTime() - issue.firstReportedAt.getTime() >=
    HIGH_PRIORITY_AGE_MS;

  return reachesConfirmationThreshold || reachesAgeThreshold
    ? "HIGH"
    : "NORMAL";
}
