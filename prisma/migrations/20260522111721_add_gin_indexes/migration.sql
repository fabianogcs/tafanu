-- CreateIndex
CREATE INDEX "Business_keywords_idx" ON "Business" USING GIN ("keywords");

-- CreateIndex
CREATE INDEX "Business_subcategory_idx" ON "Business" USING GIN ("subcategory");
