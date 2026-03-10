-- DropIndex
DROP INDEX "Business_city_idx";

-- DropIndex
DROP INDEX "Business_isActive_published_idx";

-- DropIndex
DROP INDEX "Business_state_idx";

-- CreateIndex
CREATE INDEX "Business_views_idx" ON "Business"("views");

-- CreateIndex
CREATE INDEX "Business_createdAt_idx" ON "Business"("createdAt");

-- CreateIndex
CREATE INDEX "Business_city_category_idx" ON "Business"("city", "category");

-- CreateIndex
CREATE INDEX "Business_city_neighborhood_idx" ON "Business"("city", "neighborhood");

-- CreateIndex
CREATE INDEX "Business_city_isActive_published_idx" ON "Business"("city", "isActive", "published");

-- CreateIndex
CREATE INDEX "Business_category_isActive_published_idx" ON "Business"("category", "isActive", "published");
