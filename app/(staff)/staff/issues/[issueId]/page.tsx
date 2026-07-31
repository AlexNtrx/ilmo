import { IssueDetail } from "@/components/staff/issue-detail";
import { MissingIssueState } from "@/components/staff/missing-issue-state";
import { requireStaffPageActor } from "@/lib/staff/auth";
import { getStaffIssueDetail } from "@/lib/staff/queries";

export default async function StaffIssueDetailPage({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const actor = await requireStaffPageActor();
  const { issueId: issueIdValue } = await params;
  const issueId = Number(issueIdValue);

  if (!Number.isInteger(issueId) || issueId <= 0) {
    return <MissingIssueState />;
  }

  const issue = await getStaffIssueDetail(actor, issueId);

  if (!issue) {
    return <MissingIssueState />;
  }

  return <IssueDetail issue={issue} now={new Date()} />;
}
