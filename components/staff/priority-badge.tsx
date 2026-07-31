import type { IssuePriority } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPriorityLabel } from "@/lib/staff/format";

const priorityClasses: Record<IssuePriority, string> = {
  URGENT:
    "border-urgent/25 bg-urgent-surface text-urgent-foreground",
  HIGH:
    "border-priority-high/25 bg-priority-high-surface text-priority-high-foreground",
  NORMAL: "border-primary/20 bg-secondary text-secondary-foreground",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: IssuePriority;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 font-semibold", priorityClasses[priority], className)}
    >
      {getPriorityLabel(priority)}
    </Badge>
  );
}
