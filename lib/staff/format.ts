import type { IssuePriority, IssueStatus } from "@/generated/prisma/enums";

const dateTimeFormatter = new Intl.DateTimeFormat("fi-FI", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Helsinki",
});

export function formatStaffDateTime(value: Date) {
  return dateTimeFormatter.format(value);
}

export function formatWaitingTime(firstReportedAt: Date, now: Date) {
  const minutes = Math.max(
    0,
    Math.floor((now.getTime() - firstReportedAt.getTime()) / 60_000),
  );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} h`;
  }

  return `${Math.floor(hours / 24)} pv`;
}

export function getPriorityLabel(priority: IssuePriority) {
  return {
    URGENT: "Kiireellinen",
    HIGH: "Korkea",
    NORMAL: "Normaali",
  }[priority];
}

export function getStatusLabel(status: IssueStatus) {
  return {
    OPEN: "Avoin",
    RESOLVED: "Ratkaistu",
    INVALID: "Aiheeton",
  }[status];
}
