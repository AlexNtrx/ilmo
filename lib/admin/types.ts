export type ManagedRole = "admin" | "staff";

export type ManagedCategory = {
  id: number;
  nameFi: string;
  isUrgent: boolean;
  mergeMode: "MERGE_OPEN" | "ALWAYS_CREATE";
  requiresDescription: boolean;
  isActive: boolean;
  sortOrder: number;
  issueCount: number;
};

export type ManagedUser = {
  id: string;
  name: string;
  username: string | null;
  displayUsername: string | null;
  role: ManagedRole | null;
  createdAt: string;
};

export type AdminActionResult =
  | { status: "SUCCESS"; message: string }
  | { status: "SELF_SESSION_REVOKED"; message: string }
  | { status: "PARTIAL_FAILURE"; message: string }
  | { status: "VALIDATION_ERROR"; message: string }
  | { status: "SESSION_EXPIRED"; message: string }
  | { status: "UNAUTHORIZED"; message: string }
  | { status: "NOT_FOUND"; message: string }
  | { status: "REFERENCED"; message: string }
  | { status: "LAST_ADMIN"; message: string }
  | { status: "SELF_DELETE"; message: string }
  | { status: "SERVER_ERROR"; message: string };

export type CategoryDirection = "UP" | "DOWN";
