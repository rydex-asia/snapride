ALTER TABLE "Store" ADD COLUMN "serviceRadiusKm" DECIMAL(6,2) NOT NULL DEFAULT 8;
ALTER TABLE "Store" ADD COLUMN "averagePickingMinutes" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "Store" ADD COLUMN "averageDeliverySpeedKph" DECIMAL(6,2) NOT NULL DEFAULT 18;

CREATE TABLE "DeliveryAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "house" TEXT,
    "landmark" TEXT,
    "recipientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DeliveryAddress_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DeliveryAddress_userId_isDefault_idx" ON "DeliveryAddress"("userId", "isDefault");
ALTER TABLE "DeliveryAddress" ADD CONSTRAINT "DeliveryAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
