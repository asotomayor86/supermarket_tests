-- CreateEnum
CREATE TYPE "AreaCode" AS ENUM ('PRODUCCION', 'LOGISTICA', 'APQ', 'MONTAJE');

-- CreateEnum
CREATE TYPE "OFStatus" AS ENUM ('PLANIFICADA', 'LANZADA', 'EN_CURSO', 'COMPLETADA', 'CERRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "ComponentStatus" AS ENUM ('PENDIENTE', 'VERIFICADO', 'SOLICITADO', 'PARCIALMENTE_SERVIDO', 'SERVIDO', 'CONSUMIDO', 'FALTANTE');

-- CreateEnum
CREATE TYPE "ComponentOrigin" AS ENUM ('LISTA_MATERIALES', 'ADICIONAL', 'UTILLAJE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('BORRADOR', 'ENVIADA', 'EN_PROCESO', 'PARCIALMENTE_SERVIDA', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "LineStatus" AS ENUM ('ENVIADA', 'EN_PROCESO', 'PARCIALMENTE_SERVIDA', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('TRASPASO', 'CONSUMO', 'AJUSTE', 'RECEPCION', 'DEVOLUCION');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('COMPONENTE', 'MATERIA_PRIMA', 'UTILLAJE', 'SEMIELABORADO');

-- CreateEnum
CREATE TYPE "RequestPriority" AS ENUM ('URGENTE', 'ALTA', 'NORMAL', 'BAJA');

-- CreateTable
CREATE TABLE "uom" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "description" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area" (
    "id" SERIAL NOT NULL,
    "code" "AreaCode" NOT NULL,
    "description" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_center" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_center" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "work_center_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "area_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "uom_id" INTEGER NOT NULL,
    "product_type" "ProductType" NOT NULL DEFAULT 'COMPONENTE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_user" (
    "id" SERIAL NOT NULL,
    "external_id" VARCHAR(200),
    "email" VARCHAR(200) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "area_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_balance" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "qty_available" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "qty_reserved" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movement" (
    "id" BIGSERIAL NOT NULL,
    "movement_type" "MovementType" NOT NULL,
    "product_id" INTEGER NOT NULL,
    "from_location_id" INTEGER,
    "to_location_id" INTEGER,
    "qty" DECIMAL(18,4) NOT NULL,
    "ref_of_component_id" INTEGER,
    "ref_request_line_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturing_order" (
    "id" SERIAL NOT NULL,
    "of_number" VARCHAR(30) NOT NULL,
    "description" VARCHAR(300),
    "machine_center_id" INTEGER NOT NULL,
    "status" "OFStatus" NOT NULL DEFAULT 'PLANIFICADA',
    "planned_start_at" TIMESTAMP(3) NOT NULL,
    "planned_end_at" TIMESTAMP(3),
    "actual_start_at" TIMESTAMP(3),
    "actual_end_at" TIMESTAMP(3),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturing_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "of_component" (
    "id" SERIAL NOT NULL,
    "manufacturing_order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "origin" "ComponentOrigin" NOT NULL DEFAULT 'LISTA_MATERIALES',
    "qty_required" DECIMAL(18,4) NOT NULL,
    "qty_in_production" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "qty_served" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "qty_consumed" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "status" "ComponentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "location_id" INTEGER,
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "of_component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_shortage" (
    "id" SERIAL NOT NULL,
    "of_component_id" INTEGER NOT NULL,
    "qty_shortage" DECIMAL(18,4) NOT NULL,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detected_by" INTEGER NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" INTEGER,
    "notes" TEXT,

    CONSTRAINT "component_shortage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_request" (
    "id" SERIAL NOT NULL,
    "request_number" VARCHAR(30) NOT NULL,
    "manufacturing_order_id" INTEGER NOT NULL,
    "destination_area_id" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'BORRADOR',
    "priority" "RequestPriority" NOT NULL DEFAULT 'NORMAL',
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_line" (
    "id" SERIAL NOT NULL,
    "material_request_id" INTEGER NOT NULL,
    "of_component_id" INTEGER NOT NULL,
    "qty_requested" DECIMAL(18,4) NOT NULL,
    "qty_served" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "from_location_id" INTEGER,
    "to_location_id" INTEGER,
    "status" "LineStatus" NOT NULL DEFAULT 'ENVIADA',
    "served_by" INTEGER,
    "served_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" BIGINT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uom_code_key" ON "uom"("code");

-- CreateIndex
CREATE UNIQUE INDEX "area_code_key" ON "area"("code");

-- CreateIndex
CREATE UNIQUE INDEX "work_center_code_key" ON "work_center"("code");

-- CreateIndex
CREATE UNIQUE INDEX "machine_center_code_key" ON "machine_center"("code");

-- CreateIndex
CREATE UNIQUE INDEX "location_code_key" ON "location"("code");

-- CreateIndex
CREATE UNIQUE INDEX "product_code_key" ON "product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "app_user_external_id_key" ON "app_user"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");

-- CreateIndex
CREATE INDEX "stock_balance_product_id_idx" ON "stock_balance"("product_id");

-- CreateIndex
CREATE INDEX "stock_balance_location_id_idx" ON "stock_balance"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_balance_product_id_location_id_key" ON "stock_balance"("product_id", "location_id");

-- CreateIndex
CREATE INDEX "stock_movement_product_id_idx" ON "stock_movement"("product_id");

-- CreateIndex
CREATE INDEX "stock_movement_created_at_idx" ON "stock_movement"("created_at" DESC);

-- CreateIndex
CREATE INDEX "stock_movement_ref_of_component_id_idx" ON "stock_movement"("ref_of_component_id");

-- CreateIndex
CREATE INDEX "stock_movement_ref_request_line_id_idx" ON "stock_movement"("ref_request_line_id");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturing_order_of_number_key" ON "manufacturing_order"("of_number");

-- CreateIndex
CREATE INDEX "manufacturing_order_status_idx" ON "manufacturing_order"("status");

-- CreateIndex
CREATE INDEX "manufacturing_order_machine_center_id_idx" ON "manufacturing_order"("machine_center_id");

-- CreateIndex
CREATE INDEX "manufacturing_order_planned_start_at_idx" ON "manufacturing_order"("planned_start_at");

-- CreateIndex
CREATE INDEX "of_component_manufacturing_order_id_idx" ON "of_component"("manufacturing_order_id");

-- CreateIndex
CREATE INDEX "of_component_product_id_idx" ON "of_component"("product_id");

-- CreateIndex
CREATE INDEX "of_component_status_idx" ON "of_component"("status");

-- CreateIndex
CREATE INDEX "component_shortage_of_component_id_idx" ON "component_shortage"("of_component_id");

-- CreateIndex
CREATE INDEX "component_shortage_resolved_at_idx" ON "component_shortage"("resolved_at");

-- CreateIndex
CREATE UNIQUE INDEX "material_request_request_number_key" ON "material_request"("request_number");

-- CreateIndex
CREATE INDEX "material_request_manufacturing_order_id_idx" ON "material_request"("manufacturing_order_id");

-- CreateIndex
CREATE INDEX "material_request_destination_area_id_idx" ON "material_request"("destination_area_id");

-- CreateIndex
CREATE INDEX "material_request_status_idx" ON "material_request"("status");

-- CreateIndex
CREATE INDEX "request_line_material_request_id_idx" ON "request_line"("material_request_id");

-- CreateIndex
CREATE INDEX "request_line_of_component_id_idx" ON "request_line"("of_component_id");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "machine_center" ADD CONSTRAINT "machine_center_work_center_id_fkey" FOREIGN KEY ("work_center_id") REFERENCES "work_center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_balance" ADD CONSTRAINT "stock_balance_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_balance" ADD CONSTRAINT "stock_balance_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_ref_of_component_id_fkey" FOREIGN KEY ("ref_of_component_id") REFERENCES "of_component"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_ref_request_line_id_fkey" FOREIGN KEY ("ref_request_line_id") REFERENCES "request_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_order" ADD CONSTRAINT "manufacturing_order_machine_center_id_fkey" FOREIGN KEY ("machine_center_id") REFERENCES "machine_center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_order" ADD CONSTRAINT "manufacturing_order_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_order" ADD CONSTRAINT "manufacturing_order_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "of_component" ADD CONSTRAINT "of_component_manufacturing_order_id_fkey" FOREIGN KEY ("manufacturing_order_id") REFERENCES "manufacturing_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "of_component" ADD CONSTRAINT "of_component_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "of_component" ADD CONSTRAINT "of_component_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "of_component" ADD CONSTRAINT "of_component_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "of_component" ADD CONSTRAINT "of_component_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "of_component" ADD CONSTRAINT "of_component_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_shortage" ADD CONSTRAINT "component_shortage_of_component_id_fkey" FOREIGN KEY ("of_component_id") REFERENCES "of_component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_shortage" ADD CONSTRAINT "component_shortage_detected_by_fkey" FOREIGN KEY ("detected_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_shortage" ADD CONSTRAINT "component_shortage_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_request" ADD CONSTRAINT "material_request_manufacturing_order_id_fkey" FOREIGN KEY ("manufacturing_order_id") REFERENCES "manufacturing_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_request" ADD CONSTRAINT "material_request_destination_area_id_fkey" FOREIGN KEY ("destination_area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_request" ADD CONSTRAINT "material_request_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_request" ADD CONSTRAINT "material_request_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_line" ADD CONSTRAINT "request_line_material_request_id_fkey" FOREIGN KEY ("material_request_id") REFERENCES "material_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_line" ADD CONSTRAINT "request_line_of_component_id_fkey" FOREIGN KEY ("of_component_id") REFERENCES "of_component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_line" ADD CONSTRAINT "request_line_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_line" ADD CONSTRAINT "request_line_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_line" ADD CONSTRAINT "request_line_served_by_fkey" FOREIGN KEY ("served_by") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
