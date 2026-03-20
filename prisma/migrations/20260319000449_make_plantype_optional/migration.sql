/*
  Warnings:

  - The `layout` column on the `Business` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `planType` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `eventType` on the `AnalyticsEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WHATSAPP', 'PHONE', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'WEBSITE', 'MAP', 'SHOPEE', 'MERCADOLIVRE', 'SHEIN', 'IFOOD', 'VIEW');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VISITANTE', 'CLIENTE', 'ADMIN', 'AFILIADO', 'ASSINANTE');

-- CreateEnum
CREATE TYPE "LayoutType" AS ENUM ('editorial', 'urban', 'businessList', 'showroom', 'influencer');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('monthly', 'quarterly', 'yearly');

-- AlterTable
ALTER TABLE "AnalyticsEvent" DROP COLUMN "eventType",
ADD COLUMN     "eventType" "EventType" NOT NULL;

-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "subcategory" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "theme" SET DEFAULT 'showroom_nordic',
DROP COLUMN "layout",
ADD COLUMN     "layout" "LayoutType" NOT NULL DEFAULT 'showroom';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'VISITANTE',
DROP COLUMN "planType",
ADD COLUMN     "planType" "PlanType";

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");

-- CreateIndex
CREATE INDEX "Business_name_city_idx" ON "Business"("name", "city");

-- CreateIndex
CREATE INDEX "BusinessHour_businessId_idx" ON "BusinessHour"("businessId");
