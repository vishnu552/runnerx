/*
  Warnings:

  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `CategoryTab` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `CategoryTab` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Coupon` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Coupon` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `EventCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `EventCategory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `categoryId` column on the `EventCategory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PageContent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PageContent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Registration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Registration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userId` column on the `Registration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `RegistrationLineItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `RegistrationLineItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Site` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Site` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Sponsor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Sponsor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `categoryId` on the `CategoryTab` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `eventId` on the `EventCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `eventId` on the `Registration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `registrationId` on the `RegistrationLineItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `eventCategoryId` on the `RegistrationLineItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "CategoryTab" DROP CONSTRAINT "CategoryTab_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "EventCategory" DROP CONSTRAINT "EventCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "EventCategory" DROP CONSTRAINT "EventCategory_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_userId_fkey";

-- DropForeignKey
ALTER TABLE "RegistrationLineItem" DROP CONSTRAINT "RegistrationLineItem_eventCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "RegistrationLineItem" DROP CONSTRAINT "RegistrationLineItem_registrationId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CategoryTab" DROP CONSTRAINT "CategoryTab_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD CONSTRAINT "CategoryTab_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Event" DROP CONSTRAINT "Event_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EventCategory" DROP CONSTRAINT "EventCategory_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "eventId",
ADD COLUMN     "eventId" INTEGER NOT NULL,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER,
ADD CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PageContent" DROP CONSTRAINT "PageContent_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "eventId",
ADD COLUMN     "eventId" INTEGER NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER,
ADD CONSTRAINT "Registration_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "RegistrationLineItem" DROP CONSTRAINT "RegistrationLineItem_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "registrationId",
ADD COLUMN     "registrationId" INTEGER NOT NULL,
DROP COLUMN "eventCategoryId",
ADD COLUMN     "eventCategoryId" INTEGER NOT NULL,
ADD CONSTRAINT "RegistrationLineItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Site" DROP CONSTRAINT "Site_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Site_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Sponsor" DROP CONSTRAINT "Sponsor_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "CategoryTab_categoryId_idx" ON "CategoryTab"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "EventCategory_eventId_raceType_key" ON "EventCategory"("eventId", "raceType");

-- CreateIndex
CREATE INDEX "Registration_eventId_idx" ON "Registration"("eventId");

-- CreateIndex
CREATE INDEX "Registration_userId_idx" ON "Registration"("userId");

-- CreateIndex
CREATE INDEX "RegistrationLineItem_registrationId_idx" ON "RegistrationLineItem"("registrationId");

-- CreateIndex
CREATE INDEX "RegistrationLineItem_eventCategoryId_idx" ON "RegistrationLineItem"("eventCategoryId");

-- AddForeignKey
ALTER TABLE "EventCategory" ADD CONSTRAINT "EventCategory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCategory" ADD CONSTRAINT "EventCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTab" ADD CONSTRAINT "CategoryTab_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationLineItem" ADD CONSTRAINT "RegistrationLineItem_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationLineItem" ADD CONSTRAINT "RegistrationLineItem_eventCategoryId_fkey" FOREIGN KEY ("eventCategoryId") REFERENCES "EventCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
