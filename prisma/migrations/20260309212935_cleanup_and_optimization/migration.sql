/*
  Warnings:

  - You are about to drop the column `installs` on the `Business` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "installs",
ADD COLUMN     "facebook_clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ifood" TEXT,
ADD COLUMN     "ifood_clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "instagram_clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "map_clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mercadoLivre" TEXT,
ADD COLUMN     "mercadolivre_clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shein" TEXT,
ADD COLUMN     "shein_clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shopee" TEXT,
ADD COLUMN     "shopee_clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tiktok_clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "website_clicks" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "affiliateSince" TIMESTAMP(3),
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastPayoutDate" TIMESTAMP(3),
ADD COLUMN     "lastPrice" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "mpSubscriptionId" TEXT,
ADD COLUMN     "planType" TEXT DEFAULT 'monthly';

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "flaggedBy" TEXT,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comment_businessId_idx" ON "Comment"("businessId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_businessId_createdAt_idx" ON "AnalyticsEvent"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");

-- CreateIndex
CREATE INDEX "Business_name_idx" ON "Business"("name");

-- CreateIndex
CREATE INDEX "Business_neighborhood_idx" ON "Business"("neighborhood");

-- CreateIndex
CREATE INDEX "Business_isActive_published_idx" ON "Business"("isActive", "published");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
