import "server-only";

import { buildStaffDashboard } from "@/lib/staff/dashboard";
import type { StaffActor, StaffDashboard, StaffIssueDetail } from "@/lib/staff/types";
import { prisma } from "@/lib/prisma";

export async function getStaffDashboard(
  actor: StaffActor,
): Promise<StaffDashboard> {
  assertStaffActor(actor);

  const issues = await prisma.issue.findMany({
    where: { status: "OPEN" },
    select: {
      id: true,
      priority: true,
      status: true,
      firstReportedAt: true,
      location: {
        select: {
          id: true,
          nameFi: true,
        },
      },
      category: {
        select: {
          nameFi: true,
        },
      },
      _count: {
        select: {
          confirmations: true,
        },
      },
    },
  });

  return buildStaffDashboard(
    issues.map((issue) => ({
      id: issue.id,
      priority: issue.priority,
      status: issue.status,
      firstReportedAt: issue.firstReportedAt,
      location: issue.location,
      category: issue.category,
      confirmationCount: issue._count.confirmations,
    })),
  );
}

export async function getStaffIssueDetail(
  actor: StaffActor,
  issueId: number,
): Promise<StaffIssueDetail | null> {
  assertStaffActor(actor);

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: {
      id: true,
      description: true,
      priority: true,
      status: true,
      firstReportedAt: true,
      closedAt: true,
      location: {
        select: {
          nameFi: true,
        },
      },
      category: {
        select: {
          nameFi: true,
        },
      },
      confirmations: {
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: {
          id: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });

  if (!issue) {
    return null;
  }

  return {
    id: issue.id,
    categoryNameFi: issue.category.nameFi,
    locationNameFi: issue.location.nameFi,
    priority: issue.priority,
    status: issue.status,
    confirmationCount: issue.confirmations.length,
    firstReportedAt: issue.firstReportedAt,
    description: issue.description,
    closedAt: issue.closedAt,
    confirmations: issue.confirmations,
  };
}

function assertStaffActor(actor: StaffActor) {
  if (actor.role !== "admin" && actor.role !== "staff") {
    throw new Error("Staff authorization is required.");
  }
}
