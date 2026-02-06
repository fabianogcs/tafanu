/*
  Warnings:

  - You are about to drop the column `phone` on the `Business` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "phone",
ADD COLUMN     "comercial_badge" TEXT,
ADD COLUMN     "faqs" JSONB[],
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "layout" TEXT NOT NULL DEFAULT 'editorial',
ADD COLUMN     "luxe_quote" TEXT,
ADD COLUMN     "showroom_collection" TEXT,
ADD COLUMN     "urban_tag" TEXT,
ALTER COLUMN "theme" SET DEFAULT 'cyber';
