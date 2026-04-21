-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "siteFor" TEXT NOT NULL DEFAULT 'JDH';

-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN     "siteFor" TEXT NOT NULL DEFAULT 'JDH';

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_code_key" ON "Site"("code");
