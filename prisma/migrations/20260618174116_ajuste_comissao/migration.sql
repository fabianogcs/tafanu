/*
  Warnings:

  - A unique constraint covering the columns `[mpPaymentId]` on the table `Commission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Commission_status_idx";

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "mpPaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Commission_mpPaymentId_key" ON "Commission"("mpPaymentId");

-- CreateIndex
CREATE INDEX "Commission_status_releaseDate_idx" ON "Commission"("status", "releaseDate");
