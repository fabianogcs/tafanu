-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "reportedBy" TEXT;

-- CreateIndex
CREATE INDEX "Report_businessId_idx" ON "Report"("businessId");

-- CreateIndex
CREATE INDEX "Report_reportedBy_idx" ON "Report"("reportedBy");

-- CreateIndex
CREATE INDEX "Withdrawal_affiliateId_idx" ON "Withdrawal"("affiliateId");
