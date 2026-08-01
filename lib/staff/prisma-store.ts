import type { Prisma } from "@/generated/prisma/client";
import type { CloseIssueTarget } from "@/lib/staff/types";
import type {
  StaffIssueStore,
  StaffIssueTransaction,
} from "@/lib/staff/service";
import { prisma } from "@/lib/prisma";

/** Adapts the Issue close operations to one Prisma transaction client. */
function createTransactionAdapter(
  transaction: Prisma.TransactionClient,
): StaffIssueTransaction {
  return {
    async updateOpenIssue({ issueId, targetStatus, closedAt }) {
      const result = await transaction.issue.updateMany({
        where: {
          id: issueId,
          status: "OPEN",
        },
        data: {
          status: targetStatus,
          closedAt,
        },
      });

      return result.count === 1;
    },

    async getIssueStatus(issueId) {
      const issue = await transaction.issue.findUnique({
        where: { id: issueId },
        select: { status: true },
      });

      return issue?.status ?? null;
    },

    async createStatusHistory({
      issueId,
      targetStatus,
      actorId,
      changedAt,
    }) {
      await transaction.issueStatusHistory.create({
        data: {
          issueId,
          fromStatus: "OPEN",
          toStatus: targetStatus as CloseIssueTarget,
          changeSource: "STAFF",
          changedByUserId: actorId,
          changedAt,
        },
      });
    },
  };
}

/** Runs status updates and history writes in the same database transaction. */
export const prismaStaffIssueStore: StaffIssueStore = {
  transaction(operation) {
    return prisma.$transaction((transaction) =>
      operation(createTransactionAdapter(transaction)),
    );
  },
};
