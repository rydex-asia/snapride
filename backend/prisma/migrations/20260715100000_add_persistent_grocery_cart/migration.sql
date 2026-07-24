CREATE TABLE "GroceryCart" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "storeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GroceryCart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroceryCartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GroceryCartItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GroceryCart_customerId_key" ON "GroceryCart"("customerId");
CREATE INDEX "GroceryCart_storeId_idx" ON "GroceryCart"("storeId");
CREATE UNIQUE INDEX "GroceryCartItem_cartId_productId_key" ON "GroceryCartItem"("cartId", "productId");
CREATE INDEX "GroceryCartItem_productId_idx" ON "GroceryCartItem"("productId");

ALTER TABLE "GroceryCart" ADD CONSTRAINT "GroceryCart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroceryCart" ADD CONSTRAINT "GroceryCart_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GroceryCartItem" ADD CONSTRAINT "GroceryCartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "GroceryCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroceryCartItem" ADD CONSTRAINT "GroceryCartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
