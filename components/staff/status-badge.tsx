import type { IssueStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/lib/staff/format";

const statusClasses: Record<IssueStatus, string> = {
  OPEN: "border-primary/20 bg-secondary text-secondary-foreground",
  RESOLVED:
    "border-status-resolved/20 bg-status-resolved-surface text-status-resolved-foreground",
  INVALID:
    "border-muted-foreground/15 bg-status-invalid-surface text-status-invalid-foreground",
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 font-semibold", statusClasses[status])}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}
