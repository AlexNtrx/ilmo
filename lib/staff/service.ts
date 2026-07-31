import type { IssueStatus } from "@/generated/prisma/enums";
import type {
  CloseIssueResult,
  CloseIssueTarget,
} from "@/lib/staff/types";

export type CloseIssueInput = {
  issueId: number;
  targetStatus: CloseIssueTarget;
  actorId: string;
};

export interface StaffIssueTransaction {
  updateOpenIssue(input: {
    issueId: number;
    targetStatus: CloseIssueTarget;
    closedAt: Date;
  }): Promise<boolean>;
  getIssueStatus(issueId: number): Promise<IssueStatus | null>;
  createStatusHistory(input: {
    issueId: number;
    targetStatus: CloseIssueTarget;
    actorId: string;
    changedAt: Date;
  }): Promise<void>;
}

export interface StaffIssueStore {
  transaction<T>(
    operation: (transaction: StaffIssueTransaction) => Promise<T>,
  ): Promise<T>;
}

export function createCloseIssueService({
  store,
  now = () => new Date(),
}: {
  store: StaffIssueStore;
  now?: () => Date;
}) {
  return async function closeIssue(
    input: CloseIssueInput,
  ): Promise<CloseIssueResult> {
    return store.transaction(async (transaction) => {
      const changedAt = now();
      const updated = await transaction.updateOpenIssue({
        issueId: input.issueId,
        targetStatus: input.targetStatus,
        closedAt: changedAt,
      });

      if (!updated) {
        const currentStatus = await transaction.getIssueStatus(input.issueId);

        return currentStatus
          ? { status: "ALREADY_CLOSED", currentStatus }
          : { status: "NOT_FOUND" };
      }

      await transaction.createStatusHistory({
        issueId: input.issueId,
        targetStatus: input.targetStatus,
        actorId: input.actorId,
        changedAt,
      });

      return {
        status: "SUCCESS",
        issueId: input.issueId,
        targetStatus: input.targetStatus,
      };
    });
  };
}
