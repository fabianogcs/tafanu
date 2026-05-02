/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mpSubscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `planType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "complement" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "mediaFeed" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "mpSubscriptionId" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "planType" "PlanType",
ADD COLUMN     "subscriptionStatus" TEXT DEFAULT 'inactive',
ADD COLUMN     "videos" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "withdrawalId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "expiresAt",
DROP COLUMN "mpSubscriptionId",
DROP COLUMN "planType";

-- CreateIndex
CREATE INDEX "Commission_withdrawalId_idx" ON "Commission"("withdrawalId");

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "Withdrawal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
