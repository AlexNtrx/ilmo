import "server-only";

import { prismaReportingStore } from "@/lib/reporting/prisma-store";
import { createPublicReportService } from "@/lib/reporting/service";

export const submitPublicReport = createPublicReportService({
  store: prismaReportingStore,
});
