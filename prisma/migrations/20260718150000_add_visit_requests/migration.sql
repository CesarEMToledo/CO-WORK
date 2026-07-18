-- CreateEnum
CREATE TYPE "VisitRequestType" AS ENUM ('visita', 'reserva');

-- CreateEnum
CREATE TYPE "VisitRequestStatus" AS ENUM ('pending', 'contacted', 'confirmed', 'cancelled');

-- CreateTable
CREATE TABLE "VisitRequest" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "propertyTitle" TEXT NOT NULL,
    "propertyLocation" TEXT NOT NULL,
    "type" "VisitRequestType" NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterPhone" TEXT,
    "requesterEmail" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "visitTime" TEXT NOT NULL,
    "message" TEXT,
    "agentName" TEXT NOT NULL,
    "agentPhone" TEXT NOT NULL,
    "status" "VisitRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitRequest_propertyId_idx" ON "VisitRequest"("propertyId");

-- CreateIndex
CREATE INDEX "VisitRequest_status_idx" ON "VisitRequest"("status");
