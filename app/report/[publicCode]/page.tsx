import type { Metadata } from "next";

import { ReportForm } from "@/components/public-report/report-form";
import { ReportShell } from "@/components/public-report/report-shell";
import { ReportState } from "@/components/public-report/report-state";
import { getPublicReportPageData } from "@/lib/reporting/queries";

export const metadata: Metadata = {
  title: "Tee ilmoitus | Ilmo",
};

type PublicReportPageProps = {
  params: Promise<{ publicCode: string }>;
};

export default async function PublicReportPage({
  params,
}: PublicReportPageProps) {
  const { publicCode } = await params;
  const pageData = await getPublicReportPageData(publicCode);

  if (pageData.state === "missing") {
    return (
      <ReportShell>
        <ReportState variant="invalid" />
      </ReportShell>
    );
  }

  if (pageData.state === "inactive") {
    return (
      <ReportShell>
        <ReportState variant="inactive" />
      </ReportShell>
    );
  }

  if (pageData.categories.length === 0) {
    return (
      <ReportShell>
        <ReportState variant="unavailable" />
      </ReportShell>
    );
  }

  return (
    <ReportShell>
      <ReportForm
        categories={pageData.categories}
        location={pageData.location}
        publicCode={publicCode}
      />
    </ReportShell>
  );
}
