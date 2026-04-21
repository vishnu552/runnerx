-- CreateTable
CREATE TABLE "PageContent" (
    "id" TEXT NOT NULL,
    "siteFor" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageContent_siteFor_page_idx" ON "PageContent"("siteFor", "page");

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_siteFor_page_section_key_key" ON "PageContent"("siteFor", "page", "section", "key");
