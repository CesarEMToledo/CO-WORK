-- CreateEnum
CREATE TYPE "ListingOperation" AS ENUM ('VENTA', 'RENTA');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('disponible', 'vendida', 'rentada', 'no_disponible');

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "localidad" TEXT,
    "calle" TEXT NOT NULL,
    "numero" TEXT,
    "colonia" TEXT,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "price" TEXT NOT NULL,
    "priceSuffix" TEXT,
    "operation" "ListingOperation" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specs" JSONB NOT NULL DEFAULT '[]',
    "imageUrl" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoUrl" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'disponible',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalTransaction" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "guestName" TEXT,
    "notes" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "stripeFeeAmount" DECIMAL(10,2) NOT NULL,
    "platformFeeAmount" DECIMAL(10,2) NOT NULL,
    "estimatedTaxAmount" DECIMAL(10,2) NOT NULL,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_ownerId_idx" ON "Listing"("ownerId");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "RentalTransaction_listingId_idx" ON "RentalTransaction"("listingId");

-- CreateIndex
CREATE INDEX "RentalTransaction_startDate_idx" ON "RentalTransaction"("startDate");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalTransaction" ADD CONSTRAINT "RentalTransaction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
