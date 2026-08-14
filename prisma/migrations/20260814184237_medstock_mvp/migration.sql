-- CreateEnum
CREATE TYPE "HealthCenterType" AS ENUM ('CESFAM', 'COSAM', 'SAPU', 'HOSPITAL');

-- CreateEnum
CREATE TYPE "StockRequestStatus" AS ENUM ('SEARCHING', 'PARTIALLY_COVERED', 'COVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "HealthCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HealthCenterType" NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "healthCenterId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "estimatedDailyDemand" DOUBLE PRECISION NOT NULL,
    "safetyStockDays" INTEGER NOT NULL,
    "nextRestockDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsumptionRecord" (
    "id" TEXT NOT NULL,
    "healthCenterId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantityConsumed" INTEGER NOT NULL,

    CONSTRAINT "ConsumptionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationSupplier" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,

    CONSTRAINT "MedicationSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockRequest" (
    "id" TEXT NOT NULL,
    "requesterHealthCenterId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "status" "StockRequestStatus" NOT NULL DEFAULT 'SEARCHING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockOffer" (
    "id" TEXT NOT NULL,
    "stockRequestId" TEXT NOT NULL,
    "providerHealthCenterId" TEXT NOT NULL,
    "quantityOffered" INTEGER NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "selectedQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "fromHealthCenterId" TEXT NOT NULL,
    "toHealthCenterId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequest" (
    "id" TEXT NOT NULL,
    "healthCenterId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "PurchaseRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inventory_medicationId_idx" ON "Inventory"("medicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_healthCenterId_medicationId_key" ON "Inventory"("healthCenterId", "medicationId");

-- CreateIndex
CREATE INDEX "ConsumptionRecord_healthCenterId_medicationId_date_idx" ON "ConsumptionRecord"("healthCenterId", "medicationId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MedicationSupplier_medicationId_supplierId_key" ON "MedicationSupplier"("medicationId", "supplierId");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_healthCenterId_fkey" FOREIGN KEY ("healthCenterId") REFERENCES "HealthCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumptionRecord" ADD CONSTRAINT "ConsumptionRecord_healthCenterId_fkey" FOREIGN KEY ("healthCenterId") REFERENCES "HealthCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumptionRecord" ADD CONSTRAINT "ConsumptionRecord_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationSupplier" ADD CONSTRAINT "MedicationSupplier_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationSupplier" ADD CONSTRAINT "MedicationSupplier_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_requesterHealthCenterId_fkey" FOREIGN KEY ("requesterHealthCenterId") REFERENCES "HealthCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOffer" ADD CONSTRAINT "StockOffer_stockRequestId_fkey" FOREIGN KEY ("stockRequestId") REFERENCES "StockRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOffer" ADD CONSTRAINT "StockOffer_providerHealthCenterId_fkey" FOREIGN KEY ("providerHealthCenterId") REFERENCES "HealthCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromHealthCenterId_fkey" FOREIGN KEY ("fromHealthCenterId") REFERENCES "HealthCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toHealthCenterId_fkey" FOREIGN KEY ("toHealthCenterId") REFERENCES "HealthCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_healthCenterId_fkey" FOREIGN KEY ("healthCenterId") REFERENCES "HealthCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
