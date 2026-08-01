import type { IssuePriority, IssueStatus } from "@/generated/prisma/enums";
import type { StaffDashboard } from "@/lib/staff/types";

export type DashboardIssueRecord = {
  id: number;
  priority: IssuePriority;
  status: IssueStatus;
  firstReportedAt: Date;
  location: {
    id: number;
    nameFi: string;
  };
  category: {
    nameFi: string;
  };
  confirmationCount: number;
};

const priorityRank = {
  URGENT: 0,
  HIGH: 1,
  NORMAL: 2,
} as const;

/** Builds deterministic dashboard rows and summary values from open Issue records. */
export function buildStaffDashboard(
  issues: DashboardIssueRecord[],
): StaffDashboard {
  const sortedIssues = issues
    .map((issue) => ({
      id: issue.id,
      categoryNameFi: issue.category.nameFi,
      locationNameFi: issue.location.nameFi,
      priority: issue.priority,
      status: issue.status,
      confirmationCount: issue.confirmationCount,
      firstReportedAt: issue.firstReportedAt,
    }))
    .sort(
      (left, right) =>
        priorityRank[left.priority] - priorityRank[right.priority] ||
        left.firstReportedAt.getTime() - right.firstReportedAt.getTime() ||
        left.id - right.id,
    );

  const locationTotals = new Map<
    number,
    { id: number; nameFi: string; confirmations: number }
  >();

  for (const issue of issues) {
    const current = locationTotals.get(issue.location.id);
    locationTotals.set(issue.location.id, {
      id: issue.location.id,
      nameFi: issue.location.nameFi,
      confirmations: (current?.confirmations ?? 0) + issue.confirmationCount,
    });
  }

  const topLocation = selectTopLocation([...locationTotals.values()]);

  return {
    issues: sortedIssues,
    openCount: sortedIssues.length,
    urgentCount: sortedIssues.filter((issue) => issue.priority === "URGENT")
      .length,
    topLocationNameFi: topLocation?.nameFi ?? null,
  };
}

/** Selects the leading Location with the approved Finnish and ID tie-breakers. */
export function selectTopLocation(
  locations: Array<{ id: number; nameFi: string; confirmations: number }>,
) {
  return (
    [...locations].sort(
      (left, right) =>
        right.confirmations - left.confirmations ||
        left.nameFi.localeCompare(right.nameFi, "fi") ||
        left.id - right.id,
    )[0] ?? null
  );
}
