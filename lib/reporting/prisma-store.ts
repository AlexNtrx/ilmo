import "server-only";

import {
  IssueStatus,
  IssueStatusChangeSource,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateIssueInput,
  MergeIssueInput,
  ReportingStore,
  ReportingTransaction,
} from "@/lib/reporting/service";

class PrismaReportingTransaction implements ReportingTransaction {
  constructor(private readonly transaction: Prisma.TransactionClient) {}

  findLocation(publicCode: string) {
    return this.transaction.location.findUnique({
      where: { publicCode },
      select: { id: true, isActive: true },
    });
  }

  findActiveCategories(categoryIds: number[]) {
    return this.transaction.issueCategory.findMany({
      where: {
        id: { in: categoryIds },
        isActive: true,
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: {
        id: true,
        isUrgent: true,
        mergeMode: true,
        requiresDescription: true,
      },
    });
  }

  async deleteExpiredSubmissions(before: Date) {
    await this.transaction.reportSubmission.deleteMany({
      where: { createdAt: { lt: before } },
    });
  }

  countRecentSubmissions(sourceHash: string, since: Date) {
    return this.transaction.reportSubmission.count({
      where: {
        sourceHash,
        createdAt: { gte: since },
      },
    });
  }

  async hasRecentDuplicate(
    sourceHash: string,
    payloadHash: string,
    since: Date,
  ) {
    const duplicate = await this.transaction.reportSubmission.findFirst({
      where: {
        sourceHash,
        payloadHash,
        createdAt: { gte: since },
      },
      select: { id: true },
    });

    return duplicate !== null;
  }

  async createSubmission(
    sourceHash: string,
    payloadHash: string,
    createdAt: Date,
  ) {
    await this.transaction.reportSubmission.create({
      data: { sourceHash, payloadHash, createdAt },
    });
  }

  async findOpenIssue(locationId: number, categoryId: number) {
    const issue = await this.transaction.issue.findFirst({
      where: {
        locationId,
        categoryId,
        status: IssueStatus.OPEN,
      },
      orderBy: { id: "asc" },
      select: {
        id: true,
        priority: true,
        firstReportedAt: true,
        _count: { select: { confirmations: true } },
      },
    });

    return issue
      ? {
          id: issue.id,
          priority: issue.priority,
          firstReportedAt: issue.firstReportedAt,
          confirmationCount: issue._count.confirmations,
        }
      : null;
  }

  async createIssue(input: CreateIssueInput) {
    await this.transaction.issue.create({
      data: {
        locationId: input.locationId,
        categoryId: input.categoryId,
        description: input.description,
        status: IssueStatus.OPEN,
        priority: input.priority,
        firstReportedAt: input.reportedAt,
        lastConfirmedAt: input.reportedAt,
        confirmations: {
          create: {
            description: input.description,
            sourceHash: null,
            createdAt: input.reportedAt,
          },
        },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: IssueStatus.OPEN,
            changeSource: IssueStatusChangeSource.SYSTEM,
            changedAt: input.reportedAt,
          },
        },
      },
    });
  }

  async mergeIssue(input: MergeIssueInput) {
    await this.transaction.issueConfirmation.create({
      data: {
        issueId: input.issueId,
        description: input.description,
        sourceHash: null,
        createdAt: input.confirmedAt,
      },
    });

    await this.transaction.issue.update({
      where: { id: input.issueId },
      data: {
        lastConfirmedAt: input.confirmedAt,
        priority: input.priority,
      },
    });
  }
}

export const prismaReportingStore: ReportingStore = {
  transaction(operation) {
    return prisma.$transaction(
      (transaction) =>
        operation(new PrismaReportingTransaction(transaction)),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  },
};
