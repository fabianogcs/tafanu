/*
  Warnings:

  - You are about to drop the column `heroImage` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Business` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "heroImage",
DROP COLUMN "videoUrl";

-- CreateIndex
CREATE INDEX "Business_city_idx" ON "Business"("city");
