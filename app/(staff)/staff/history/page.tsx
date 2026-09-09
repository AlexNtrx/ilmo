import type { Metadata } from "next";

import { IssueHistory } from "@/components/staff/issue-history";
import { requireStaffPageActor } from "@/lib/staff/auth";
import { getStaffIssueHistory } from "@/lib/staff/queries";

export const metadata: Metadata = {
  title: "Ilmoitushistoria | Ilmo",
};

export default async function StaffHistoryPage() {
  const actor = await requireStaffPageActor();
  const issues = await getStaffIssueHistory(actor);

  return <IssueHistory issues={issues} />;
}
