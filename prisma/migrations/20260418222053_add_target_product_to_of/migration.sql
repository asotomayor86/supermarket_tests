-- AlterTable
ALTER TABLE "manufacturing_order" ADD COLUMN     "qty_planned" DECIMAL(18,4),
ADD COLUMN     "target_product_id" INTEGER;

-- AddForeignKey
ALTER TABLE "manufacturing_order" ADD CONSTRAINT "manufacturing_order_target_product_id_fkey" FOREIGN KEY ("target_product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
