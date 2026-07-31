import Link from "next/link";
import { ArrowLeftIcon, ClockIcon, MessageSquareTextIcon } from "lucide-react";

import { IssueActions } from "@/components/staff/issue-actions";
import { PriorityBadge } from "@/components/staff/priority-badge";
import { StatusBadge } from "@/components/staff/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatStaffDateTime,
  formatWaitingTime,
} from "@/lib/staff/format";
import type { StaffIssueDetail } from "@/lib/staff/types";

function DetailValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}

export function IssueDetail({
  issue,
  now,
}: {
  issue: StaffIssueDetail;
  now: Date;
}) {
  const laterDescriptions = issue.confirmations
    .slice(1)
    .filter(
      (
        confirmation,
      ): confirmation is typeof confirmation & { description: string } =>
        Boolean(confirmation.description),
    );
  const isOpen = issue.status === "OPEN";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/staff"
        className="inline-flex min-h-11 items-center gap-2 rounded-md font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        Takaisin ilmoituksiin
      </Link>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={issue.priority} />
          <StatusBadge status={issue.status} />
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            {issue.locationNameFi}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            {issue.categoryNameFi}
          </h1>
        </div>
      </div>

      {!isOpen ? (
        <Alert>
          <AlertTitle>Ilmoitus on jo suljettu</AlertTitle>
          <AlertDescription>
            Tiedot ovat luettavissa, mutta suljettua ilmoitusta ei voi muuttaa
            uudelleen.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="pt-5">
          <dl className="grid gap-6 sm:grid-cols-2">
            <DetailValue label="Sijainti">{issue.locationNameFi}</DetailValue>
            <DetailValue label="Ensimmäinen ilmoitus">
              {formatStaffDateTime(issue.firstReportedAt)}
            </DetailValue>
            <DetailValue label="Ilmoituksia">
              {issue.confirmationCount}
            </DetailValue>
            <DetailValue label="Odotusaika">
              <span className="inline-flex items-center gap-2">
                <ClockIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                {formatWaitingTime(issue.firstReportedAt, now)}
              </span>
            </DetailValue>
          </dl>
        </CardContent>
      </Card>

      <section aria-labelledby="description-heading" className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquareTextIcon
            aria-hidden="true"
            className="size-5 text-primary"
          />
          <h2 id="description-heading" className="text-lg font-semibold">
            Kuvaus
          </h2>
        </div>
        <Card>
          <CardContent className="space-y-5 pt-5">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground">
                Ensimmäinen ilmoitus
              </h3>
              <p className="mt-2 leading-7">
                {issue.description ?? "Ei lisätietoja."}
              </p>
            </div>

            {laterDescriptions.length > 0 ? (
              <div className="border-t pt-5">
                <h3 className="text-xs font-semibold text-muted-foreground">
                  Myöhemmät lisätiedot
                </h3>
                <ol className="mt-3 space-y-4">
                  {laterDescriptions.map((confirmation) => (
                    <li key={confirmation.id}>
                      <p className="leading-7">{confirmation.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatStaffDateTime(confirmation.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      {isOpen ? (
        <section aria-labelledby="actions-heading" className="space-y-3">
          <h2 id="actions-heading" className="text-lg font-semibold">
            Päivitä tila
          </h2>
          <IssueActions
            issueId={issue.id}
            categoryNameFi={issue.categoryNameFi}
            locationNameFi={issue.locationNameFi}
          />
        </section>
      ) : null}
    </div>
  );
}
