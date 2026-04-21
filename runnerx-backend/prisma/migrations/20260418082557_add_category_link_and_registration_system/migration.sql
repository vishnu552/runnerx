-- AlterTable
ALTER TABLE "EventCategory" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "couponCode" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "paymentId" TEXT,
    "eventTitleSnapshot" TEXT NOT NULL,
    "eventDateSnapshot" TIMESTAMP(3) NOT NULL,
    "siteForSnapshot" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationLineItem" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "eventCategoryId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "participantEmail" TEXT NOT NULL,
    "participantPhone" TEXT NOT NULL,
    "participantGender" TEXT NOT NULL,
    "participantDob" TIMESTAMP(3) NOT NULL,
    "participantCity" TEXT,
    "participantState" TEXT,
    "participantCountry" TEXT,
    "participantPinCode" TEXT,
    "participantAddress" TEXT,
    "isRegistrant" BOOLEAN NOT NULL DEFAULT false,
    "categoryNameSnapshot" TEXT NOT NULL,
    "distanceSnapshot" TEXT NOT NULL,
    "raceTypeSnapshot" TEXT NOT NULL,
    "unitPriceSnapshot" DOUBLE PRECISION NOT NULL,
    "discountPriceSnapshot" DOUBLE PRECISION,
    "finalPriceSnapshot" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistrationLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Registration_eventId_idx" ON "Registration"("eventId");

-- CreateIndex
CREATE INDEX "Registration_userId_idx" ON "Registration"("userId");

-- CreateIndex
CREATE INDEX "RegistrationLineItem_registrationId_idx" ON "RegistrationLineItem"("registrationId");

-- CreateIndex
CREATE INDEX "RegistrationLineItem_eventCategoryId_idx" ON "RegistrationLineItem"("eventCategoryId");

-- AddForeignKey
ALTER TABLE "EventCategory" ADD CONSTRAINT "EventCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationLineItem" ADD CONSTRAINT "RegistrationLineItem_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationLineItem" ADD CONSTRAINT "RegistrationLineItem_eventCategoryId_fkey" FOREIGN KEY ("eventCategoryId") REFERENCES "EventCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
