import { ReportShell } from "@/components/public-report/report-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicReportLoading() {
  return (
    <ReportShell>
      <div aria-busy="true" aria-label="Ladataan ilmoituslomaketta">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-4 h-10 w-4/5" />
        <Skeleton className="mt-3 h-5 w-full max-w-sm" />
        <Skeleton className="mt-2 h-5 w-2/3" />
        <div className="my-8 h-px bg-border" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-3 h-5 w-72 max-w-full" />
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton className="h-14 w-full" key={index} />
          ))}
        </div>
      </div>
    </ReportShell>
  );
}
