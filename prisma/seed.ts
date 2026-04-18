import "dotenv/config";
import { PrismaClient, OFStatus, ComponentOrigin } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL_NON_POOLING });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─────────────────────────────────────────────
  // UOM
  // ─────────────────────────────────────────────
  const uoms = await Promise.all([
    prisma.uom.upsert({ where: { code: "UN" },  update: {}, create: { code: "UN",  description: "Unidad" } }),
    prisma.uom.upsert({ where: { code: "KG" },  update: {}, create: { code: "KG",  description: "Kilogramo" } }),
    prisma.uom.upsert({ where: { code: "M" },   update: {}, create: { code: "M",   description: "Metro" } }),
    prisma.uom.upsert({ where: { code: "M2" },  update: {}, create: { code: "M2",  description: "Metro cuadrado" } }),
    prisma.uom.upsert({ where: { code: "L" },   update: {}, create: { code: "L",   description: "Litro" } }),
    prisma.uom.upsert({ where: { code: "PZ" },  update: {}, create: { code: "PZ",  description: "Pieza" } }),
    prisma.uom.upsert({ where: { code: "JGO" }, update: {}, create: { code: "JGO", description: "Juego" } }),
  ]);
  console.log(`  ✓ ${uoms.length} UoMs`);

  const uomMap = Object.fromEntries(uoms.map((u) => [u.code, u.id]));

  // ─────────────────────────────────────────────
  // ÁREAS
  // ─────────────────────────────────────────────
  const areas = await Promise.all([
    prisma.area.upsert({ where: { code: "PRODUCCION" }, update: {}, create: { code: "PRODUCCION", description: "Producción" } }),
    prisma.area.upsert({ where: { code: "LOGISTICA" },  update: {}, create: { code: "LOGISTICA",  description: "Logística" } }),
    prisma.area.upsert({ where: { code: "APQ" },        update: {}, create: { code: "APQ",        description: "APQ" } }),
    prisma.area.upsert({ where: { code: "MONTAJE" },    update: {}, create: { code: "MONTAJE",    description: "Montaje" } }),
  ]);
  console.log(`  ✓ ${areas.length} Áreas`);

  const areaMap = Object.fromEntries(areas.map((a) => [a.code, a.id]));

  // ─────────────────────────────────────────────
  // CENTROS DE TRABAJO
  // ─────────────────────────────────────────────
  const workCenters = await Promise.all([
    prisma.workCenter.upsert({ where: { code: "CW-MECA" },   update: {}, create: { code: "CW-MECA",   description: "Mecanizado CNC" } }),
    prisma.workCenter.upsert({ where: { code: "CW-SOLD" },   update: {}, create: { code: "CW-SOLD",   description: "Soldadura" } }),
    prisma.workCenter.upsert({ where: { code: "CW-MONT" },   update: {}, create: { code: "CW-MONT",   description: "Montaje Final" } }),
    prisma.workCenter.upsert({ where: { code: "CW-ACAB" },   update: {}, create: { code: "CW-ACAB",   description: "Acabados y Pintura" } }),
  ]);
  console.log(`  ✓ ${workCenters.length} Centros de trabajo`);

  const wcMap = Object.fromEntries(workCenters.map((w) => [w.code, w.id]));

  // ─────────────────────────────────────────────
  // CENTROS DE MÁQUINA
  // ─────────────────────────────────────────────
  const machineCenters = await Promise.all([
    prisma.machineCenter.upsert({ where: { code: "MC-001" }, update: {}, create: { code: "MC-001", description: "Torno CNC Mazak",      workCenterId: wcMap["CW-MECA"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-002" }, update: {}, create: { code: "MC-002", description: "Fresadora CNC Haas",    workCenterId: wcMap["CW-MECA"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-003" }, update: {}, create: { code: "MC-003", description: "Soldadura MIG Línea 1", workCenterId: wcMap["CW-SOLD"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-004" }, update: {}, create: { code: "MC-004", description: "Soldadura TIG Línea 2", workCenterId: wcMap["CW-SOLD"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-005" }, update: {}, create: { code: "MC-005", description: "Línea de Montaje A",    workCenterId: wcMap["CW-MONT"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-006" }, update: {}, create: { code: "MC-006", description: "Línea de Montaje B",    workCenterId: wcMap["CW-MONT"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-007" }, update: {}, create: { code: "MC-007", description: "Cabina de Pintura",     workCenterId: wcMap["CW-ACAB"] } }),
  ]);
  console.log(`  ✓ ${machineCenters.length} Centros de máquina`);

  const mcMap = Object.fromEntries(machineCenters.map((m) => [m.code, m.id]));

  // ─────────────────────────────────────────────
  // UBICACIONES
  // ─────────────────────────────────────────────
  const locations = await Promise.all([
    prisma.location.upsert({ where: { code: "ALM-GEN" },  update: {}, create: { code: "ALM-GEN",  description: "Almacén General",          areaId: areaMap["LOGISTICA"] } }),
    prisma.location.upsert({ where: { code: "ALM-COMP" }, update: {}, create: { code: "ALM-COMP", description: "Almacén de Componentes",    areaId: areaMap["LOGISTICA"] } }),
    prisma.location.upsert({ where: { code: "ALM-UTIL" }, update: {}, create: { code: "ALM-UTIL", description: "Almacén de Utillajes",      areaId: areaMap["LOGISTICA"] } }),
    prisma.location.upsert({ where: { code: "SUP-A" },    update: {}, create: { code: "SUP-A",    description: "Supermarket Línea A",       areaId: areaMap["PRODUCCION"] } }),
    prisma.location.upsert({ where: { code: "SUP-B" },    update: {}, create: { code: "SUP-B",    description: "Supermarket Línea B",       areaId: areaMap["PRODUCCION"] } }),
    prisma.location.upsert({ where: { code: "APQ-ZONA" }, update: {}, create: { code: "APQ-ZONA", description: "Zona APQ",                  areaId: areaMap["APQ"] } }),
    prisma.location.upsert({ where: { code: "MON-ZONA" }, update: {}, create: { code: "MON-ZONA", description: "Zona Montaje",              areaId: areaMap["MONTAJE"] } }),
    prisma.location.upsert({ where: { code: "PROD-WIP" }, update: {}, create: { code: "PROD-WIP", description: "WIP en planta",             areaId: areaMap["PRODUCCION"] } }),
  ]);
  console.log(`  ✓ ${locations.length} Ubicaciones`);

  const locMap = Object.fromEntries(locations.map((l) => [l.code, l.id]));

  // ─────────────────────────────────────────────
  // PRODUCTOS
  // ─────────────────────────────────────────────
  const products = await Promise.all([
    // Componentes mecanizados
    prisma.product.upsert({ where: { code: "COMP-001" }, update: {}, create: { code: "COMP-001", description: "Eje principal Ø50 acero F114",      uomId: uomMap["UN"],  productType: "COMPONENTE" } }),
    prisma.product.upsert({ where: { code: "COMP-002" }, update: {}, create: { code: "COMP-002", description: "Casquillo bronce Ø30×60",           uomId: uomMap["UN"],  productType: "COMPONENTE" } }),
    prisma.product.upsert({ where: { code: "COMP-003" }, update: {}, create: { code: "COMP-003", description: "Placa base aluminio 200×150×10",    uomId: uomMap["UN"],  productType: "COMPONENTE" } }),
    prisma.product.upsert({ where: { code: "COMP-004" }, update: {}, create: { code: "COMP-004", description: "Tornillo M8×25 DIN 933 acero 8.8",  uomId: uomMap["PZ"],  productType: "COMPONENTE" } }),
    prisma.product.upsert({ where: { code: "COMP-005" }, update: {}, create: { code: "COMP-005", description: "Arandela Ø8 DIN 125 acero inox",    uomId: uomMap["PZ"],  productType: "COMPONENTE" } }),
    prisma.product.upsert({ where: { code: "COMP-006" }, update: {}, create: { code: "COMP-006", description: "Rodamiento SKF 6205-2RS",           uomId: uomMap["UN"],  productType: "COMPONENTE" } }),
    prisma.product.upsert({ where: { code: "COMP-007" }, update: {}, create: { code: "COMP-007", description: "Retén de aceite 25×40×7",           uomId: uomMap["UN"],  productType: "COMPONENTE" } }),
    // Materia prima
    prisma.product.upsert({ where: { code: "MP-001" },   update: {}, create: { code: "MP-001",   description: "Barra acero F114 Ø60 L=3000mm",    uomId: uomMap["M"],   productType: "MATERIA_PRIMA" } }),
    prisma.product.upsert({ where: { code: "MP-002" },   update: {}, create: { code: "MP-002",   description: "Chapa acero S235 3mm",              uomId: uomMap["M2"],  productType: "MATERIA_PRIMA" } }),
    prisma.product.upsert({ where: { code: "MP-003" },   update: {}, create: { code: "MP-003",   description: "Perfil aluminio 40×40 L=6000mm",   uomId: uomMap["M"],   productType: "MATERIA_PRIMA" } }),
    // Semielaborados
    prisma.product.upsert({ where: { code: "SEMI-001" }, update: {}, create: { code: "SEMI-001", description: "Subconjunto soldado bastidor",      uomId: uomMap["UN"],  productType: "SEMIELABORADO" } }),
    prisma.product.upsert({ where: { code: "SEMI-002" }, update: {}, create: { code: "SEMI-002", description: "Subconjunto eje + rodamientos",     uomId: uomMap["JGO"], productType: "SEMIELABORADO" } }),
    // Utillajes
    prisma.product.upsert({ where: { code: "UTIL-001" }, update: {}, create: { code: "UTIL-001", description: "Útil de centrado OF-MECA",          uomId: uomMap["UN"],  productType: "UTILLAJE" } }),
    prisma.product.upsert({ where: { code: "UTIL-002" }, update: {}, create: { code: "UTIL-002", description: "Plantilla de taladrado Ø8",         uomId: uomMap["UN"],  productType: "UTILLAJE" } }),
    prisma.product.upsert({ where: { code: "UTIL-003" }, update: {}, create: { code: "UTIL-003", description: "Mordaza de sujeción universal",     uomId: uomMap["UN"],  productType: "UTILLAJE" } }),
  ]);
  console.log(`  ✓ ${products.length} Productos`);

  const prodMap = Object.fromEntries(products.map((p) => [p.code, p.id]));

  // ─────────────────────────────────────────────
  // USUARIOS
  // ─────────────────────────────────────────────
  const users = await Promise.all([
    prisma.appUser.upsert({ where: { email: "admin@planta.com" },      update: {}, create: { email: "admin@planta.com",      name: "Administrador",          areaId: null } }),
    prisma.appUser.upsert({ where: { email: "produccion1@planta.com" },update: {}, create: { email: "produccion1@planta.com",name: "Carlos Ruiz (Producción)",areaId: areaMap["PRODUCCION"] } }),
    prisma.appUser.upsert({ where: { email: "produccion2@planta.com" },update: {}, create: { email: "produccion2@planta.com",name: "Ana López (Producción)",  areaId: areaMap["PRODUCCION"] } }),
    prisma.appUser.upsert({ where: { email: "logistica1@planta.com" }, update: {}, create: { email: "logistica1@planta.com", name: "Luis Martín (Logística)", areaId: areaMap["LOGISTICA"] } }),
    prisma.appUser.upsert({ where: { email: "logistica2@planta.com" }, update: {}, create: { email: "logistica2@planta.com", name: "Sara Gómez (Logística)",  areaId: areaMap["LOGISTICA"] } }),
    prisma.appUser.upsert({ where: { email: "apq1@planta.com" },       update: {}, create: { email: "apq1@planta.com",       name: "Pedro Díaz (APQ)",        areaId: areaMap["APQ"] } }),
    prisma.appUser.upsert({ where: { email: "montaje1@planta.com" },   update: {}, create: { email: "montaje1@planta.com",   name: "María Torres (Montaje)",  areaId: areaMap["MONTAJE"] } }),
  ]);
  console.log(`  ✓ ${users.length} Usuarios`);

  const userMap = Object.fromEntries(users.map((u) => [u.email, u.id]));

  // ─────────────────────────────────────────────
  // STOCK INICIAL
  // ─────────────────────────────────────────────
  const stockData = [
    { productId: prodMap["COMP-001"], locationId: locMap["ALM-COMP"], qtyAvailable: 25 },
    { productId: prodMap["COMP-002"], locationId: locMap["ALM-COMP"], qtyAvailable: 50 },
    { productId: prodMap["COMP-003"], locationId: locMap["ALM-COMP"], qtyAvailable: 30 },
    { productId: prodMap["COMP-004"], locationId: locMap["ALM-COMP"], qtyAvailable: 500 },
    { productId: prodMap["COMP-005"], locationId: locMap["ALM-COMP"], qtyAvailable: 500 },
    { productId: prodMap["COMP-006"], locationId: locMap["ALM-COMP"], qtyAvailable: 40 },
    { productId: prodMap["COMP-007"], locationId: locMap["ALM-COMP"], qtyAvailable: 20 },
    { productId: prodMap["MP-001"],   locationId: locMap["ALM-GEN"],  qtyAvailable: 15 },
    { productId: prodMap["MP-002"],   locationId: locMap["ALM-GEN"],  qtyAvailable: 80 },
    { productId: prodMap["MP-003"],   locationId: locMap["ALM-GEN"],  qtyAvailable: 60 },
    { productId: prodMap["SEMI-001"], locationId: locMap["ALM-COMP"], qtyAvailable: 8 },
    { productId: prodMap["SEMI-002"], locationId: locMap["ALM-COMP"], qtyAvailable: 12 },
    // Utillajes en su almacén
    { productId: prodMap["UTIL-001"], locationId: locMap["ALM-UTIL"], qtyAvailable: 3 },
    { productId: prodMap["UTIL-002"], locationId: locMap["ALM-UTIL"], qtyAvailable: 5 },
    { productId: prodMap["UTIL-003"], locationId: locMap["ALM-UTIL"], qtyAvailable: 4 },
    // Stock en supermarket línea A (reposición ya realizada)
    { productId: prodMap["COMP-001"], locationId: locMap["SUP-A"], qtyAvailable: 5 },
    { productId: prodMap["COMP-004"], locationId: locMap["SUP-A"], qtyAvailable: 100 },
    { productId: prodMap["COMP-005"], locationId: locMap["SUP-A"], qtyAvailable: 100 },
    { productId: prodMap["COMP-006"], locationId: locMap["SUP-A"], qtyAvailable: 8 },
  ];

  for (const s of stockData) {
    await prisma.stockBalance.upsert({
      where:  { productId_locationId: { productId: s.productId, locationId: s.locationId } },
      update: { qtyAvailable: s.qtyAvailable },
      create: { productId: s.productId, locationId: s.locationId, qtyAvailable: s.qtyAvailable },
    });
  }
  console.log(`  ✓ ${stockData.length} Saldos de stock`);

  // ─────────────────────────────────────────────
  // ÓRDENES DE FABRICACIÓN
  // ─────────────────────────────────────────────
  const now = new Date();
  const d = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86_400_000);

  const of1 = await prisma.manufacturingOrder.upsert({
    where:  { ofNumber: "OF-000001" },
    update: {},
    create: {
      ofNumber:       "OF-000001",
      description:    "Conjunto reductor serie RX-200",
      machineCenterId: mcMap["MC-005"],
      status:         OFStatus.EN_CURSO,
      plannedStartAt: d(-1),
      plannedEndAt:   d(2),
      actualStartAt:  d(-1),
      createdBy:      userMap["admin@planta.com"],
    },
  });

  const of2 = await prisma.manufacturingOrder.upsert({
    where:  { ofNumber: "OF-000002" },
    update: {},
    create: {
      ofNumber:       "OF-000002",
      description:    "Eje de transmisión serie TX-50",
      machineCenterId: mcMap["MC-001"],
      status:         OFStatus.LANZADA,
      plannedStartAt: d(1),
      plannedEndAt:   d(3),
      createdBy:      userMap["admin@planta.com"],
    },
  });

  const of3 = await prisma.manufacturingOrder.upsert({
    where:  { ofNumber: "OF-000003" },
    update: {},
    create: {
      ofNumber:       "OF-000003",
      description:    "Bastidor soldado serie BS-10",
      machineCenterId: mcMap["MC-003"],
      status:         OFStatus.PLANIFICADA,
      plannedStartAt: d(3),
      plannedEndAt:   d(5),
      createdBy:      userMap["admin@planta.com"],
    },
  });

  const of4 = await prisma.manufacturingOrder.upsert({
    where:  { ofNumber: "OF-000004" },
    update: {},
    create: {
      ofNumber:       "OF-000004",
      description:    "Subconjunto pintura lote 24/04",
      machineCenterId: mcMap["MC-007"],
      status:         OFStatus.COMPLETADA,
      plannedStartAt: d(-5),
      plannedEndAt:   d(-3),
      actualStartAt:  d(-5),
      actualEndAt:    d(-3),
      createdBy:      userMap["admin@planta.com"],
    },
  });

  console.log("  ✓ 4 Órdenes de fabricación");

  // ─────────────────────────────────────────────
  // COMPONENTES DE OF
  // ─────────────────────────────────────────────

  // OF-000001 — EN_CURSO: componentes en distintos estados
  await prisma.oFComponent.createMany({
    skipDuplicates: true,
    data: [
      {
        manufacturingOrderId: of1.id,
        productId:            prodMap["COMP-001"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          4,
        qtyServed:            4,
        qtyConsumed:          2,
        status:               "PARCIALMENTE_SERVIDO",
        locationId:           locMap["SUP-A"],
        createdBy:            userMap["admin@planta.com"],
      },
      {
        manufacturingOrderId: of1.id,
        productId:            prodMap["COMP-006"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          8,
        qtyServed:            8,
        qtyConsumed:          8,
        status:               "CONSUMIDO",
        locationId:           locMap["SUP-A"],
        createdBy:            userMap["admin@planta.com"],
      },
      {
        manufacturingOrderId: of1.id,
        productId:            prodMap["COMP-004"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          32,
        qtyServed:            0,
        qtyConsumed:          0,
        status:               "PENDIENTE",
        createdBy:            userMap["admin@planta.com"],
      },
      {
        manufacturingOrderId: of1.id,
        productId:            prodMap["SEMI-002"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          2,
        qtyServed:            0,
        qtyConsumed:          0,
        status:               "FALTANTE",
        createdBy:            userMap["produccion1@planta.com"],
      },
      {
        manufacturingOrderId: of1.id,
        productId:            prodMap["UTIL-001"],
        origin:               ComponentOrigin.UTILLAJE,
        qtyRequired:          1,
        qtyServed:            1,
        qtyConsumed:          0,
        status:               "SERVIDO",
        locationId:           locMap["PROD-WIP"],
        createdBy:            userMap["produccion1@planta.com"],
      },
    ],
  });

  // OF-000002 — LANZADA: componentes pendientes de solicitar
  await prisma.oFComponent.createMany({
    skipDuplicates: true,
    data: [
      {
        manufacturingOrderId: of2.id,
        productId:            prodMap["MP-001"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          3,
        status:               "PENDIENTE",
        createdBy:            userMap["admin@planta.com"],
      },
      {
        manufacturingOrderId: of2.id,
        productId:            prodMap["COMP-002"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          6,
        status:               "PENDIENTE",
        createdBy:            userMap["admin@planta.com"],
      },
      {
        manufacturingOrderId: of2.id,
        productId:            prodMap["COMP-007"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          6,
        status:               "PENDIENTE",
        createdBy:            userMap["admin@planta.com"],
      },
      {
        manufacturingOrderId: of2.id,
        productId:            prodMap["UTIL-002"],
        origin:               ComponentOrigin.UTILLAJE,
        qtyRequired:          1,
        status:               "PENDIENTE",
        createdBy:            userMap["produccion2@planta.com"],
      },
    ],
  });

  // OF-000003 — PLANIFICADA: componentes creados al planificar
  await prisma.oFComponent.createMany({
    skipDuplicates: true,
    data: [
      {
        manufacturingOrderId: of3.id,
        productId:            prodMap["MP-002"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          12,
        status:               "PENDIENTE",
        createdBy:            userMap["admin@planta.com"],
      },
      {
        manufacturingOrderId: of3.id,
        productId:            prodMap["COMP-003"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          4,
        status:               "PENDIENTE",
        createdBy:            userMap["admin@planta.com"],
      },
      {
        manufacturingOrderId: of3.id,
        productId:            prodMap["COMP-004"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          24,
        status:               "PENDIENTE",
        createdBy:            userMap["admin@planta.com"],
      },
    ],
  });

  // OF-000004 — COMPLETADA: todo consumido
  await prisma.oFComponent.createMany({
    skipDuplicates: true,
    data: [
      {
        manufacturingOrderId: of4.id,
        productId:            prodMap["SEMI-001"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          3,
        qtyServed:            3,
        qtyConsumed:          3,
        status:               "CONSUMIDO",
        createdBy:            userMap["admin@planta.com"],
      },
      {
        manufacturingOrderId: of4.id,
        productId:            prodMap["MP-002"],
        origin:               ComponentOrigin.LISTA_MATERIALES,
        qtyRequired:          6,
        qtyServed:            6,
        qtyConsumed:          6,
        status:               "CONSUMIDO",
        createdBy:            userMap["admin@planta.com"],
      },
    ],
  });

  const totalComponents = await prisma.oFComponent.count();
  console.log(`  ✓ ${totalComponents} Componentes de OF`);

  console.log("\n✅ Seed completado.\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
