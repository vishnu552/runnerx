-- DropForeignKey
ALTER TABLE "CategoryPageContent" DROP CONSTRAINT "CategoryPageContent_categoryId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "cardImage" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "discountPrice" DOUBLE PRECISION,
ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "raceDate" TIMESTAMP(3),
ADD COLUMN     "tagline" TEXT;

-- DropTable
DROP TABLE "CategoryPageContent";

-- CreateTable
CREATE TABLE "CategoryTab" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryTab_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoryTab_categoryId_idx" ON "CategoryTab"("categoryId");

-- AddForeignKey
ALTER TABLE "CategoryTab" ADD CONSTRAINT "CategoryTab_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
