-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "siteFor" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distanceLabel" TEXT NOT NULL,
    "icon" TEXT,
    "price" DOUBLE PRECISION,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryPageContent" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroImage" TEXT,
    "tagline" TEXT,
    "description" TEXT,
    "highlights" TEXT,
    "whoShouldRun" TEXT,
    "routeStart" TEXT,
    "routeFinish" TEXT,
    "routeTerrain" TEXT,
    "routeHighlights" TEXT,
    "timingReporting" TEXT,
    "timingFlagOff" TEXT,
    "timingCutOff" TEXT,
    "included" TEXT,
    "ageEligibility" TEXT,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryPageContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_siteFor_idx" ON "Category"("siteFor");

-- CreateIndex
CREATE UNIQUE INDEX "Category_siteFor_slug_key" ON "Category"("siteFor", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryPageContent_categoryId_key" ON "CategoryPageContent"("categoryId");

-- AddForeignKey
ALTER TABLE "CategoryPageContent" ADD CONSTRAINT "CategoryPageContent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
