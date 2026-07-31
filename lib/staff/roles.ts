import type { StaffRole } from "@/lib/staff/types";

export function parseStaffRole(value: unknown): StaffRole | null {
  return value === "admin" || value === "staff" ? value : null;
}
