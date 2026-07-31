"use client";

import { AlertCircleIcon } from "lucide-react";

import { ReportShell } from "@/components/public-report/report-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function PublicReportError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ReportShell>
      <section
        aria-labelledby="report-error-title"
        className="border-t border-border pt-10 sm:pt-14"
      >
        <h1
          id="report-error-title"
          className="text-balance text-3xl font-semibold tracking-[-0.035em]"
        >
          Sivua ei voitu ladata
        </h1>
        <p className="mt-4 max-w-[46ch] leading-7 text-muted-foreground">
          Palvelussa on tilapäinen häiriö. Yritä hetken kuluttua uudelleen.
        </p>
        <Alert className="mt-8" variant="destructive">
          <AlertCircleIcon aria-hidden="true" />
          <AlertTitle>Lataaminen epäonnistui</AlertTitle>
          <AlertDescription>
            Voit yrittää ladata ilmoituslomakkeen uudelleen.
          </AlertDescription>
        </Alert>
        <Button className="mt-6" onClick={reset} type="button">
          Yritä uudelleen
        </Button>
      </section>
    </ReportShell>
  );
}
