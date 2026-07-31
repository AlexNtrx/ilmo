import Link from "next/link";
import { ArrowRightIcon, InboxIcon } from "lucide-react";

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
import { formatWaitingTime } from "@/lib/staff/format";
import type { StaffDashboard } from "@/lib/staff/types";

function SummaryItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string | number;
  wide?: boolean;
}) {
  return (
    <Card className={wide ? "sm:col-span-2 lg:col-span-1" : undefined}>
      <CardContent className="flex min-h-24 flex-col justify-center gap-1 pt-5">
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
        <strong className="text-xl leading-tight">{value}</strong>
      </CardContent>
    </Card>
  );
}

export function Dashboard({
  dashboard,
  now,
}: {
  dashboard: StaffDashboard;
  now: Date;
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-semibold text-primary">
          Henkilökunnan näkymä
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Avoimet ilmoitukset
        </h1>
      </div>

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">
          Yhteenveto
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[11rem_11rem_minmax(16rem,1fr)]">
          <SummaryItem label="Avoimet" value={dashboard.openCount} />
          <SummaryItem label="Kiireelliset" value={dashboard.urgentCount} />
          <SummaryItem
            label="Eniten ilmoituksia"
            value={dashboard.topLocationNameFi ?? "—"}
            wide
          />
        </div>
      </section>

      {dashboard.issues.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 pt-5 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <InboxIcon aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Ei avoimia ilmoituksia</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Uudet ilmoitukset näkyvät tässä.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 lg:hidden">
            {dashboard.issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/staff/issues/${issue.id}`}
                className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="transition-colors group-hover:border-primary/35 group-hover:bg-card/80">
                  <CardContent className="space-y-4 pt-5">
                    <div className="flex items-center justify-between gap-3">
                      <PriorityBadge priority={issue.priority} />
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
                      · {formatWaitingTime(issue.firstReportedAt, now)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="hidden overflow-hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prioriteetti</TableHead>
                  <TableHead>Sijainti</TableHead>
                  <TableHead>Ongelma</TableHead>
                  <TableHead>Ilmoitukset</TableHead>
                  <TableHead>Odotusaika</TableHead>
                  <TableHead>Tila</TableHead>
                  <TableHead>
                    <span className="sr-only">Avaa</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <PriorityBadge priority={issue.priority} />
                    </TableCell>
                    <TableCell className="font-semibold">
                      {issue.locationNameFi}
                    </TableCell>
                    <TableCell>{issue.categoryNameFi}</TableCell>
                    <TableCell>{issue.confirmationCount}</TableCell>
                    <TableCell>
                      {formatWaitingTime(issue.firstReportedAt, now)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={issue.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/staff/issues/${issue.id}`}
                        className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
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
