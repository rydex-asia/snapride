CREATE TYPE "SupportRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

CREATE TABLE "GroceryOrderStatusEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "GroceryOrderStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroceryOrderStatusEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GrocerySupportRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT,
    "status" "SupportRequestStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GrocerySupportRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GroceryOrderStatusEvent_orderId_createdAt_idx" ON "GroceryOrderStatusEvent"("orderId", "createdAt");
CREATE INDEX "GrocerySupportRequest_customerId_status_idx" ON "GrocerySupportRequest"("customerId", "status");
CREATE INDEX "GrocerySupportRequest_orderId_createdAt_idx" ON "GrocerySupportRequest"("orderId", "createdAt");
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");
CREATE INDEX "PushToken_userId_isActive_idx" ON "PushToken"("userId", "isActive");

ALTER TABLE "GroceryOrderStatusEvent" ADD CONSTRAINT "GroceryOrderStatusEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "GroceryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GrocerySupportRequest" ADD CONSTRAINT "GrocerySupportRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "GroceryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GrocerySupportRequest" ADD CONSTRAINT "GrocerySupportRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
