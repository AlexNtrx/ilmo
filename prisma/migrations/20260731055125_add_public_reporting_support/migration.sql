-- AlterTable
ALTER TABLE "IssueConfirmation" ADD COLUMN     "description" VARCHAR(200);

-- CreateTable
CREATE TABLE "ReportSubmission" (
    "id" SERIAL NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportSubmission_sourceHash_createdAt_idx" ON "ReportSubmission"("sourceHash", "createdAt");

-- CreateIndex
CREATE INDEX "ReportSubmission_sourceHash_payloadHash_createdAt_idx" ON "ReportSubmission"("sourceHash", "payloadHash", "createdAt");
