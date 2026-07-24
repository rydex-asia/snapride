ALTER TABLE "Category" ADD COLUMN "slug" TEXT;
ALTER TABLE "Category" ADD COLUMN "imageKey" TEXT;

ALTER TABLE "Product" ADD COLUMN "sku" TEXT;
ALTER TABLE "Product" ADD COLUMN "brand" TEXT;
ALTER TABLE "Product" ADD COLUMN "unit" TEXT;
ALTER TABLE "Product" ADD COLUMN "mrp" DECIMAL(10,2);
ALTER TABLE "Product" ADD COLUMN "imageKey" TEXT;
ALTER TABLE "Product" ADD COLUMN "variantGroup" TEXT;

CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
