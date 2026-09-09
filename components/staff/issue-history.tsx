import Link from "next/link";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";

import { PriorityBadge } from "@/components/staff/priority-badge";
import { StatusBadge } from "@/components/staff/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatStaffDateTime } from "@/lib/staff/format";
import type { StaffIssueHistoryItem } from "@/lib/staff/types";

export function IssueHistory({
  issues,
}: {
  issues: StaffIssueHistoryItem[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-semibold text-primary">
          Henkilökunnan näkymä
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ilmoitushistoria
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kaikki ratkaistut ja suljetut ilmoitukset.
        </p>
      </div>

      {issues.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 pt-5 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <CheckCircle2Icon aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Ei suljettuja ilmoituksia</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ratkaistut ja aiheettomat ilmoitukset näkyvät tässä.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card List */}
          <div className="grid gap-3 lg:hidden">
            {issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/staff/issues/${issue.id}`}
                className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="transition-colors group-hover:border-primary/35 group-hover:bg-card/80">
                  <CardContent className="space-y-4 pt-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={issue.status} />
                        <PriorityBadge priority={issue.priority} />
                      </div>
                      <ArrowRightIcon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                    <div>
                      <h2 className="font-semibold">{issue.locationNameFi}</h2>
                      <p className="mt-1 text-sm">{issue.categoryNameFi}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {issue.confirmationCount}{" "}
                      {issue.confirmationCount === 1
                        ? "ilmoitus"
                        : "ilmoitusta"}{" "}
                      {issue.closedAt ? `· Suljettu ${formatStaffDateTime(issue.closedAt)}` : ""}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden overflow-hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tila</TableHead>
                  <TableHead>Prioriteetti</TableHead>
                  <TableHead>Sijainti</TableHead>
                  <TableHead>Ongelma</TableHead>
                  <TableHead>Ilmoitukset</TableHead>
                  <TableHead>Suljettu</TableHead>
                  <TableHead>
                    <span className="sr-only">Avaa</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow
                    key={issue.id}
                    className="group relative isolate cursor-pointer hover:bg-muted/60 focus-within:bg-muted/60"
                  >
                    <TableCell>
                      <StatusBadge status={issue.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={issue.priority} />
                    </TableCell>
                    <TableCell className="font-semibold">
                      {issue.locationNameFi}
                    </TableCell>
                    <TableCell>{issue.categoryNameFi}</TableCell>
                    <TableCell>{issue.confirmationCount}</TableCell>
                    <TableCell>
                      {issue.closedAt
                        ? formatStaffDateTime(issue.closedAt)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/staff/issues/${issue.id}`}
                        className="absolute inset-0 z-10 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
                      >
                        <span className="sr-only">
                          {issue.locationNameFi}: {issue.categoryNameFi}
                        </span>
                      </Link>
                      <Link
                        href={`/staff/issues/${issue.id}`}
                        className="relative z-20 inline-flex min-h-10 items-center gap-1 rounded-md border border-border/70 bg-muted/30 px-2.5 text-sm font-semibold text-primary outline-none hover:bg-accent/55 active:bg-accent/80 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        Avaa
                        <ArrowRightIcon aria-hidden="true" className="size-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
