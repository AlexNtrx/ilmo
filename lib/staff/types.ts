import type { IssuePriority, IssueStatus } from "@/generated/prisma/enums";

export type StaffRole = "admin" | "staff";

export type StaffActor = {
  id: string;
  name: string;
  role: StaffRole;
};

export type StaffIssueListItem = {
  id: number;
  categoryNameFi: string;
  locationNameFi: string;
  priority: IssuePriority;
  status: IssueStatus;
  confirmationCount: number;
  firstReportedAt: Date;
};

export type StaffDashboard = {
  issues: StaffIssueListItem[];
  openCount: number;
  urgentCount: number;
  topLocationNameFi: string | null;
};

export type StaffIssueDetail = StaffIssueListItem & {
  description: string | null;
  closedAt: Date | null;
  confirmations: Array<{
    id: number;
    description: string | null;
    createdAt: Date;
  }>;
};

export type CloseIssueTarget = "RESOLVED" | "INVALID";

export type CloseIssueResult =
  | {
      status: "SUCCESS";
      issueId: number;
      targetStatus: CloseIssueTarget;
    }
  | { status: "NOT_FOUND" }
  | { status: "ALREADY_CLOSED"; currentStatus: IssueStatus };

export type CloseIssueActionResult =
  | { status: "IDLE" }
  | {
      status: "SUCCESS";
      issueId: number;
      targetStatus: CloseIssueTarget;
    }
  | {
      status:
        | "VALIDATION_ERROR"
        | "UNAUTHORIZED"
        | "SESSION_EXPIRED"
        | "NOT_FOUND"
        | "ALREADY_CLOSED"
        | "SERVER_ERROR";
      message: string;
    };

export type CloseIssueActionResponse = Exclude<
  CloseIssueActionResult,
  { status: "IDLE" }
>;

export const initialCloseIssueActionResult: CloseIssueActionResult = {
  status: "IDLE",
};

export type SignOutActionResult =
  { status: "SUCCESS" } | { status: "SERVER_ERROR"; message: string };
