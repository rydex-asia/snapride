-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'PARTNER', 'ADMIN', 'STORE_OWNER');

-- CreateEnum
CREATE TYPE "SourceApp" AS ENUM ('RIDE_APP', 'FREZO_APP', 'PARTNER_APP', 'ADMIN_PANEL');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('RIDE', 'PARCEL', 'GROCERY');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BIKE', 'AUTO', 'CAB');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('OFFLINE', 'ONLINE', 'BUSY', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('SEARCHING', 'ACCEPTED', 'ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParcelStatus" AS ENUM ('SEARCHING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GroceryOrderStatus" AS ENUM ('CREATED', 'CONFIRMED', 'PACKING', 'SEARCHING_PARTNER', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('QUEUED', 'ASSIGNED', 'ACCEPTED', 'EXPIRED', 'REASSIGNING', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('CASH', 'UPI', 'CARD', 'WALLET');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'SMS', 'EMAIL', 'SOCKET');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "passwordHash" TEXT,
    "fullName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'OFFLINE',
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.0,
    "totalEarnings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "activeOrderId" TEXT,
    "activeOrderType" "OrderType",
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "heading" DECIMAL(6,2),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "plateNumber" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RideOrder" (
    "id" TEXT NOT NULL,
    "sourceApp" "SourceApp" NOT NULL,
    "customerId" TEXT NOT NULL,
    "partnerId" TEXT,
    "vehicleType" "VehicleType" NOT NULL,
    "status" "RideStatus" NOT NULL DEFAULT 'SEARCHING',
    "pickupAddress" TEXT NOT NULL,
    "pickupLat" DECIMAL(10,7) NOT NULL,
    "pickupLng" DECIMAL(10,7) NOT NULL,
    "dropAddress" TEXT NOT NULL,
    "dropLat" DECIMAL(10,7) NOT NULL,
    "dropLng" DECIMAL(10,7) NOT NULL,
    "distanceMeters" INTEGER,
    "durationSeconds" INTEGER,
    "estimatedFare" DECIMAL(10,2) NOT NULL,
    "finalFare" DECIMAL(10,2),
    "otpHash" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "arrivedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RideOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParcelOrder" (
    "id" TEXT NOT NULL,
    "sourceApp" "SourceApp" NOT NULL,
    "customerId" TEXT NOT NULL,
    "partnerId" TEXT,
    "status" "ParcelStatus" NOT NULL DEFAULT 'SEARCHING',
    "senderName" TEXT NOT NULL,
    "senderPhone" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "receiverPhone" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupLat" DECIMAL(10,7) NOT NULL,
    "pickupLng" DECIMAL(10,7) NOT NULL,
    "dropAddress" TEXT NOT NULL,
    "dropLat" DECIMAL(10,7) NOT NULL,
    "dropLng" DECIMAL(10,7) NOT NULL,
    "notes" TEXT,
    "estimatedFare" DECIMAL(10,2) NOT NULL,
    "finalFare" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParcelOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroceryOrder" (
    "id" TEXT NOT NULL,
    "sourceApp" "SourceApp" NOT NULL,
    "customerId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "partnerId" TEXT,
    "status" "GroceryOrderStatus" NOT NULL DEFAULT 'CREATED',
    "deliveryAddress" TEXT NOT NULL,
    "deliveryLat" DECIMAL(10,7) NOT NULL,
    "deliveryLng" DECIMAL(10,7) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroceryOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroceryOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "GroceryOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispatchJob" (
    "id" TEXT NOT NULL,
    "sourceApp" "SourceApp" NOT NULL,
    "orderType" "OrderType" NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "DispatchStatus" NOT NULL DEFAULT 'QUEUED',
    "partnerId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rideOrderId" TEXT,
    "parcelOrderId" TEXT,
    "groceryOrderId" TEXT,

    CONSTRAINT "DispatchJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerLocation" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "heading" DECIMAL(6,2),
    "speedMps" DECIMAL(8,2),
    "accuracyM" DECIMAL(8,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "externalRef" TEXT,
    "rideOrderId" TEXT,
    "parcelOrderId" TEXT,
    "groceryOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_userId_key" ON "Partner"("userId");

-- CreateIndex
CREATE INDEX "Partner_status_idx" ON "Partner"("status");

-- CreateIndex
CREATE INDEX "Partner_latitude_longitude_idx" ON "Partner"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Partner_activeOrderType_activeOrderId_idx" ON "Partner"("activeOrderType", "activeOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");

-- CreateIndex
CREATE INDEX "Vehicle_partnerId_idx" ON "Vehicle"("partnerId");

-- CreateIndex
CREATE INDEX "Vehicle_type_isActive_idx" ON "Vehicle"("type", "isActive");

-- CreateIndex
CREATE INDEX "RideOrder_sourceApp_status_idx" ON "RideOrder"("sourceApp", "status");

-- CreateIndex
CREATE INDEX "RideOrder_customerId_createdAt_idx" ON "RideOrder"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "RideOrder_partnerId_status_idx" ON "RideOrder"("partnerId", "status");

-- CreateIndex
CREATE INDEX "RideOrder_pickupLat_pickupLng_idx" ON "RideOrder"("pickupLat", "pickupLng");

-- CreateIndex
CREATE INDEX "ParcelOrder_sourceApp_status_idx" ON "ParcelOrder"("sourceApp", "status");

-- CreateIndex
CREATE INDEX "ParcelOrder_customerId_createdAt_idx" ON "ParcelOrder"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "ParcelOrder_partnerId_status_idx" ON "ParcelOrder"("partnerId", "status");

-- CreateIndex
CREATE INDEX "Store_ownerId_idx" ON "Store"("ownerId");

-- CreateIndex
CREATE INDEX "Store_isActive_idx" ON "Store"("isActive");

-- CreateIndex
CREATE INDEX "Store_latitude_longitude_idx" ON "Store"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Product_storeId_isActive_idx" ON "Product"("storeId", "isActive");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "GroceryOrder_sourceApp_status_idx" ON "GroceryOrder"("sourceApp", "status");

-- CreateIndex
CREATE INDEX "GroceryOrder_customerId_createdAt_idx" ON "GroceryOrder"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "GroceryOrder_storeId_status_idx" ON "GroceryOrder"("storeId", "status");

-- CreateIndex
CREATE INDEX "GroceryOrder_partnerId_status_idx" ON "GroceryOrder"("partnerId", "status");

-- CreateIndex
CREATE INDEX "GroceryOrderItem_orderId_idx" ON "GroceryOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "GroceryOrderItem_productId_idx" ON "GroceryOrderItem"("productId");

-- CreateIndex
CREATE INDEX "DispatchJob_status_priority_createdAt_idx" ON "DispatchJob"("status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "DispatchJob_orderType_orderId_idx" ON "DispatchJob"("orderType", "orderId");

-- CreateIndex
CREATE INDEX "DispatchJob_partnerId_status_idx" ON "DispatchJob"("partnerId", "status");

-- CreateIndex
CREATE INDEX "PartnerLocation_partnerId_createdAt_idx" ON "PartnerLocation"("partnerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideOrder" ADD CONSTRAINT "RideOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideOrder" ADD CONSTRAINT "RideOrder_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelOrder" ADD CONSTRAINT "ParcelOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelOrder" ADD CONSTRAINT "ParcelOrder_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryOrder" ADD CONSTRAINT "GroceryOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryOrder" ADD CONSTRAINT "GroceryOrder_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryOrder" ADD CONSTRAINT "GroceryOrder_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryOrderItem" ADD CONSTRAINT "GroceryOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "GroceryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryOrderItem" ADD CONSTRAINT "GroceryOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchJob" ADD CONSTRAINT "DispatchJob_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchJob" ADD CONSTRAINT "DispatchJob_rideOrderId_fkey" FOREIGN KEY ("rideOrderId") REFERENCES "RideOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchJob" ADD CONSTRAINT "DispatchJob_parcelOrderId_fkey" FOREIGN KEY ("parcelOrderId") REFERENCES "ParcelOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchJob" ADD CONSTRAINT "DispatchJob_groceryOrderId_fkey" FOREIGN KEY ("groceryOrderId") REFERENCES "GroceryOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerLocation" ADD CONSTRAINT "PartnerLocation_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rideOrderId_fkey" FOREIGN KEY ("rideOrderId") REFERENCES "RideOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_parcelOrderId_fkey" FOREIGN KEY ("parcelOrderId") REFERENCES "ParcelOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_groceryOrderId_fkey" FOREIGN KEY ("groceryOrderId") REFERENCES "GroceryOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

