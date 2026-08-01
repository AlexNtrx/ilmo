import type { StaffRole } from "@/lib/staff/types";

/** Accepts only the two scalar roles authorized to enter the staff workspace. */
export function parseStaffRole(value: unknown): StaffRole | null {
  return value === "admin" || value === "staff" ? value : null;
}
