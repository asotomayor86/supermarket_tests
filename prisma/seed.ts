import "dotenv/config";
import { PrismaClient, OFStatus, ComponentOrigin, RequestStatus, LineStatus, MovementType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL_NON_POOLING });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed completo...\n");

  // ── 1. UOM ──────────────────────────────────────────────��───────────────────
  const uoms = await Promise.all([
    prisma.uom.upsert({ where: { code: "UN"  }, update: {}, create: { code: "UN",  description: "Unidad" } }),
    prisma.uom.upsert({ where: { code: "KG"  }, update: {}, create: { code: "KG",  description: "Kilogramo" } }),
    prisma.uom.upsert({ where: { code: "M"   }, update: {}, create: { code: "M",   description: "Metro" } }),
    prisma.uom.upsert({ where: { code: "M2"  }, update: {}, create: { code: "M2",  description: "Metro cuadrado" } }),
    prisma.uom.upsert({ where: { code: "L"   }, update: {}, create: { code: "L",   description: "Litro" } }),
    prisma.uom.upsert({ where: { code: "PZ"  }, update: {}, create: { code: "PZ",  description: "Pieza" } }),
    prisma.uom.upsert({ where: { code: "JGO" }, update: {}, create: { code: "JGO", description: "Juego" } }),
  ]);
  const uom = Object.fromEntries(uoms.map(u => [u.code, u.id]));
  console.log(`  ✓ ${uoms.length} UoMs`);

  // ── 2. ÁREAS ────────────────────────────��──────────────────────────��────────
  const areas = await Promise.all([
    prisma.area.upsert({ where: { code: "PRODUCCION" }, update: {}, create: { code: "PRODUCCION", description: "Producción" } }),
    prisma.area.upsert({ where: { code: "LOGISTICA"  }, update: {}, create: { code: "LOGISTICA",  description: "Logística" } }),
    prisma.area.upsert({ where: { code: "APQ"        }, update: {}, create: { code: "APQ",        description: "APQ" } }),
    prisma.area.upsert({ where: { code: "MONTAJE"    }, update: {}, create: { code: "MONTAJE",    description: "Montaje" } }),
  ]);
  const area = Object.fromEntries(areas.map(a => [a.code, a.id]));
  console.log(`  ✓ ${areas.length} Áreas`);

  // ── 3. CENTROS DE TRABAJO ───────────────────────────��───────────────────��───
  const wcs = await Promise.all([
    prisma.workCenter.upsert({ where: { code: "CW-MECA" }, update: {}, create: { code: "CW-MECA", description: "Mecanizado CNC" } }),
    prisma.workCenter.upsert({ where: { code: "CW-SOLD" }, update: {}, create: { code: "CW-SOLD", description: "Soldadura" } }),
    prisma.workCenter.upsert({ where: { code: "CW-MONT" }, update: {}, create: { code: "CW-MONT", description: "Montaje Final" } }),
    prisma.workCenter.upsert({ where: { code: "CW-ACAB" }, update: {}, create: { code: "CW-ACAB", description: "Acabados y Pintura" } }),
  ]);
  const wc = Object.fromEntries(wcs.map(w => [w.code, w.id]));
  console.log(`  ✓ ${wcs.length} Centros de trabajo`);

  // ── 4. CENTROS DE MÁQUINA ───────────────────────��───────────────────────────
  const mcs = await Promise.all([
    prisma.machineCenter.upsert({ where: { code: "MC-001" }, update: {}, create: { code: "MC-001", description: "Torno CNC Mazak",      workCenterId: wc["CW-MECA"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-002" }, update: {}, create: { code: "MC-002", description: "Fresadora CNC Haas",    workCenterId: wc["CW-MECA"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-003" }, update: {}, create: { code: "MC-003", description: "Soldadura MIG Línea 1", workCenterId: wc["CW-SOLD"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-004" }, update: {}, create: { code: "MC-004", description: "Soldadura TIG Línea 2", workCenterId: wc["CW-SOLD"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-005" }, update: {}, create: { code: "MC-005", description: "Línea de Montaje A",    workCenterId: wc["CW-MONT"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-006" }, update: {}, create: { code: "MC-006", description: "Línea de Montaje B",    workCenterId: wc["CW-MONT"] } }),
    prisma.machineCenter.upsert({ where: { code: "MC-007" }, update: {}, create: { code: "MC-007", description: "Cabina de Pintura",     workCenterId: wc["CW-ACAB"] } }),
  ]);
  const mc = Object.fromEntries(mcs.map(m => [m.code, m.id]));
  console.log(`  ✓ ${mcs.length} Centros de máquina`);

  // ── 5. UBICACIONES ────────────────────────────��────────────────────────────��
  const locs = await Promise.all([
    prisma.location.upsert({ where: { code: "ALM-GEN"  }, update: {}, create: { code: "ALM-GEN",  description: "Almacén General",        areaId: area["LOGISTICA"]  } }),
    prisma.location.upsert({ where: { code: "ALM-COMP" }, update: {}, create: { code: "ALM-COMP", description: "Almacén de Componentes",  areaId: area["LOGISTICA"]  } }),
    prisma.location.upsert({ where: { code: "ALM-UTIL" }, update: {}, create: { code: "ALM-UTIL", description: "Almacén de Utillajes",    areaId: area["LOGISTICA"]  } }),
    prisma.location.upsert({ where: { code: "SUP-A"    }, update: {}, create: { code: "SUP-A",    description: "Supermarket Línea A",     areaId: area["PRODUCCION"] } }),
    prisma.location.upsert({ where: { code: "SUP-B"    }, update: {}, create: { code: "SUP-B",    description: "Supermarket Línea B",     areaId: area["PRODUCCION"] } }),
    prisma.location.upsert({ where: { code: "APQ-ZONA" }, update: {}, create: { code: "APQ-ZONA", description: "Zona APQ",                areaId: area["APQ"]        } }),
    prisma.location.upsert({ where: { code: "MON-ZONA" }, update: {}, create: { code: "MON-ZONA", description: "Zona Montaje",            areaId: area["MONTAJE"]    } }),
    prisma.location.upsert({ where: { code: "PROD-WIP" }, update: {}, create: { code: "PROD-WIP", description: "WIP en planta",           areaId: area["PRODUCCION"] } }),
  ]);
  const loc = Object.fromEntries(locs.map(l => [l.code, l.id]));
  console.log(`  ✓ ${locs.length} Ubicaciones`);

  // ── 6. PRODUCTOS ───────────────────────────────��────────────────────────────
  const prods = await Promise.all([
    prisma.product.upsert({ where: { code: "COMP-001" }, update: {}, create: { code: "COMP-001", description: "Eje principal Ø50 acero F114",     uomId: uom["UN"],  productType: "COMPONENTE"    } }),
    prisma.product.upsert({ where: { code: "COMP-002" }, update: {}, create: { code: "COMP-002", description: "Casquillo bronce Ø30×60",          uomId: uom["UN"],  productType: "COMPONENTE"    } }),
    prisma.product.upsert({ where: { code: "COMP-003" }, update: {}, create: { code: "COMP-003", description: "Placa base aluminio 200×150×10",   uomId: uom["UN"],  productType: "COMPONENTE"    } }),
    prisma.product.upsert({ where: { code: "COMP-004" }, update: {}, create: { code: "COMP-004", description: "Tornillo M8×25 DIN 933 acero 8.8", uomId: uom["PZ"],  productType: "COMPONENTE"    } }),
    prisma.product.upsert({ where: { code: "COMP-005" }, update: {}, create: { code: "COMP-005", description: "Arandela Ø8 DIN 125 acero inox",   uomId: uom["PZ"],  productType: "COMPONENTE"    } }),
    prisma.product.upsert({ where: { code: "COMP-006" }, update: {}, create: { code: "COMP-006", description: "Rodamiento SKF 6205-2RS",          uomId: uom["UN"],  productType: "COMPONENTE"    } }),
    prisma.product.upsert({ where: { code: "COMP-007" }, update: {}, create: { code: "COMP-007", description: "Retén de aceite 25×40×7",          uomId: uom["UN"],  productType: "COMPONENTE"    } }),
    prisma.product.upsert({ where: { code: "MP-001"   }, update: {}, create: { code: "MP-001",   description: "Barra acero F114 Ø60 L=3000mm",   uomId: uom["M"],   productType: "MATERIA_PRIMA" } }),
    prisma.product.upsert({ where: { code: "MP-002"   }, update: {}, create: { code: "MP-002",   description: "Chapa acero S235 3mm",             uomId: uom["M2"],  productType: "MATERIA_PRIMA" } }),
    prisma.product.upsert({ where: { code: "MP-003"   }, update: {}, create: { code: "MP-003",   description: "Perfil aluminio 40×40 L=6000mm",  uomId: uom["M"],   productType: "MATERIA_PRIMA" } }),
    prisma.product.upsert({ where: { code: "SEMI-001" }, update: {}, create: { code: "SEMI-001", description: "Subconjunto soldado bastidor",     uomId: uom["UN"],  productType: "SEMIELABORADO" } }),
    prisma.product.upsert({ where: { code: "SEMI-002" }, update: {}, create: { code: "SEMI-002", description: "Subconjunto eje + rodamientos",    uomId: uom["JGO"], productType: "SEMIELABORADO" } }),
    prisma.product.upsert({ where: { code: "UTIL-001" }, update: {}, create: { code: "UTIL-001", description: "Útil de centrado OF-MECA",         uomId: uom["UN"],  productType: "UTILLAJE"      } }),
    prisma.product.upsert({ where: { code: "UTIL-002" }, update: {}, create: { code: "UTIL-002", description: "Plantilla de taladrado Ø8",        uomId: uom["UN"],  productType: "UTILLAJE"      } }),
    prisma.product.upsert({ where: { code: "UTIL-003" }, update: {}, create: { code: "UTIL-003", description: "Mordaza de sujeción universal",    uomId: uom["UN"],  productType: "UTILLAJE"      } }),
  ]);
  const prod = Object.fromEntries(prods.map(p => [p.code, p.id]));
  console.log(`  ✓ ${prods.length} Productos`);

  // ── 7. USUARIOS ────────────────────────��───────────────────────────────��────
  const users = await Promise.all([
    prisma.appUser.upsert({ where: { email: "admin@planta.com"       }, update: {}, create: { email: "admin@planta.com",       name: "Administrador",           areaId: null              } }),
    prisma.appUser.upsert({ where: { email: "produccion1@planta.com" }, update: {}, create: { email: "produccion1@planta.com", name: "Carlos Ruiz (Producción)", areaId: area["PRODUCCION"] } }),
    prisma.appUser.upsert({ where: { email: "produccion2@planta.com" }, update: {}, create: { email: "produccion2@planta.com", name: "Ana López (Producción)",   areaId: area["PRODUCCION"] } }),
    prisma.appUser.upsert({ where: { email: "logistica1@planta.com"  }, update: {}, create: { email: "logistica1@planta.com",  name: "Luis Martín (Logística)",  areaId: area["LOGISTICA"]  } }),
    prisma.appUser.upsert({ where: { email: "logistica2@planta.com"  }, update: {}, create: { email: "logistica2@planta.com",  name: "Sara Gómez (Logística)",   areaId: area["LOGISTICA"]  } }),
    prisma.appUser.upsert({ where: { email: "apq1@planta.com"        }, update: {}, create: { email: "apq1@planta.com",        name: "Pedro Díaz (APQ)",         areaId: area["APQ"]        } }),
    prisma.appUser.upsert({ where: { email: "montaje1@planta.com"    }, update: {}, create: { email: "montaje1@planta.com",    name: "María Torres (Montaje)",   areaId: area["MONTAJE"]    } }),
  ]);
  const user = Object.fromEntries(users.map(u => [u.email, u.id]));
  console.log(`  ✓ ${users.length} Usuarios`);

  // ── 8. ÓRDENES DE FABRICACIÓN ───────────────────────────���───────────────────
  const now = new Date();
  const d = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86_400_000);

  const of1 = await prisma.manufacturingOrder.upsert({
    where:  { ofNumber: "OF-000001" }, update: {},
    create: { ofNumber: "OF-000001", description: "Conjunto reductor serie RX-200",  machineCenterId: mc["MC-005"], status: OFStatus.EN_CURSO,    plannedStartAt: d(-1), plannedEndAt: d(2),  actualStartAt: d(-1), createdBy: user["admin@planta.com"] },
  });
  const of2 = await prisma.manufacturingOrder.upsert({
    where:  { ofNumber: "OF-000002" }, update: {},
    create: { ofNumber: "OF-000002", description: "Eje de transmisión serie TX-50",  machineCenterId: mc["MC-001"], status: OFStatus.LANZADA,     plannedStartAt: d(1),  plannedEndAt: d(3),  createdBy: user["admin@planta.com"] },
  });
  const of3 = await prisma.manufacturingOrder.upsert({
    where:  { ofNumber: "OF-000003" }, update: {},
    create: { ofNumber: "OF-000003", description: "Bastidor soldado serie BS-10",    machineCenterId: mc["MC-003"], status: OFStatus.PLANIFICADA, plannedStartAt: d(3),  plannedEndAt: d(5),  createdBy: user["admin@planta.com"] },
  });
  const of4 = await prisma.manufacturingOrder.upsert({
    where:  { ofNumber: "OF-000004" }, update: {},
    create: { ofNumber: "OF-000004", description: "Subconjunto pintura lote 24/04",  machineCenterId: mc["MC-007"], status: OFStatus.COMPLETADA,  plannedStartAt: d(-5), plannedEndAt: d(-3), actualStartAt: d(-5), actualEndAt: d(-3), createdBy: user["admin@planta.com"] },
  });
  const of5 = await prisma.manufacturingOrder.upsert({
    where:  { ofNumber: "OF-000005" }, update: {},
    create: { ofNumber: "OF-000005", description: "Subconjunto fresado lote especial", machineCenterId: mc["MC-002"], status: OFStatus.LANZADA, plannedStartAt: d(0), plannedEndAt: d(2), createdBy: user["admin@planta.com"] },
  });
  console.log("  ✓ 5 Órdenes de fabricación");

  // ── 9. COMPONENTES DE OF ────────────────────────────────────────────────────
  // Usamos upsert por of+product para poder re-ejecutar el seed
  const compUpsert = async (data: Parameters<typeof prisma.oFComponent.create>[0]["data"]) => {
    const existing = await prisma.oFComponent.findFirst({
      where: { manufacturingOrderId: data.manufacturingOrderId as number, productId: data.productId as number },
    });
    if (existing) return existing;
    return prisma.oFComponent.create({ data });
  };

  // OF-000001 (EN_CURSO) — varios estados
  const c1_comp001 = await compUpsert({ manufacturingOrderId: of1.id, productId: prod["COMP-001"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 4,  qtyServed: 4,  qtyConsumed: 2, status: "PARCIALMENTE_SERVIDO", locationId: loc["PROD-WIP"], createdBy: user["admin@planta.com"] });
  const c1_comp006 = await compUpsert({ manufacturingOrderId: of1.id, productId: prod["COMP-006"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 8,  qtyServed: 8,  qtyConsumed: 8, status: "CONSUMIDO",            locationId: loc["PROD-WIP"], createdBy: user["admin@planta.com"] });
  const c1_comp004 = await compUpsert({ manufacturingOrderId: of1.id, productId: prod["COMP-004"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 32, qtyServed: 0,  qtyConsumed: 0, status: "PENDIENTE",             createdBy: user["admin@planta.com"] });
  const c1_semi002 = await compUpsert({ manufacturingOrderId: of1.id, productId: prod["SEMI-002"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 2,  qtyServed: 0,  qtyConsumed: 0, status: "FALTANTE",              createdBy: user["produccion1@planta.com"] });
  const c1_util001 = await compUpsert({ manufacturingOrderId: of1.id, productId: prod["UTIL-001"], origin: ComponentOrigin.UTILLAJE,         qtyRequired: 1,  qtyServed: 1,  qtyConsumed: 0, status: "SERVIDO",               locationId: loc["PROD-WIP"], createdBy: user["produccion1@planta.com"] });
  const c1_comp005 = await compUpsert({ manufacturingOrderId: of1.id, productId: prod["COMP-005"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 16, qtyServed: 0,  qtyConsumed: 0, status: "VERIFICADO",            createdBy: user["produccion1@planta.com"] });

  // OF-000002 (LANZADA) — todos pendientes
  const c2_mp001   = await compUpsert({ manufacturingOrderId: of2.id, productId: prod["MP-001"],   origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 3,  status: "PENDIENTE", createdBy: user["admin@planta.com"] });
  const c2_comp002 = await compUpsert({ manufacturingOrderId: of2.id, productId: prod["COMP-002"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 6,  status: "PENDIENTE", createdBy: user["admin@planta.com"] });
  const c2_comp007 = await compUpsert({ manufacturingOrderId: of2.id, productId: prod["COMP-007"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 6,  status: "PENDIENTE", createdBy: user["admin@planta.com"] });
  await            compUpsert({ manufacturingOrderId: of2.id, productId: prod["UTIL-002"], origin: ComponentOrigin.UTILLAJE,         qtyRequired: 1,  status: "PENDIENTE", createdBy: user["produccion2@planta.com"] });

  // OF-000003 (PLANIFICADA)
  await compUpsert({ manufacturingOrderId: of3.id, productId: prod["MP-002"],   origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 12, status: "PENDIENTE", createdBy: user["admin@planta.com"] });
  await compUpsert({ manufacturingOrderId: of3.id, productId: prod["COMP-003"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 4,  status: "PENDIENTE", createdBy: user["admin@planta.com"] });
  await compUpsert({ manufacturingOrderId: of3.id, productId: prod["COMP-004"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 24, status: "PENDIENTE", createdBy: user["admin@planta.com"] });

  // OF-000004 (COMPLETADA)
  const c4_semi001 = await compUpsert({ manufacturingOrderId: of4.id, productId: prod["SEMI-001"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 3, qtyServed: 3, qtyConsumed: 3, status: "CONSUMIDO", createdBy: user["admin@planta.com"] });
  const c4_mp002   = await compUpsert({ manufacturingOrderId: of4.id, productId: prod["MP-002"],   origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 6, qtyServed: 6, qtyConsumed: 6, status: "CONSUMIDO", createdBy: user["admin@planta.com"] });

  // OF-000005 (LANZADA) — mezcla: algunos solicitados a APQ/Montaje
  const c5_comp002 = await compUpsert({ manufacturingOrderId: of5.id, productId: prod["COMP-002"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 4, qtyServed: 4, qtyConsumed: 0, status: "SERVIDO",    locationId: loc["PROD-WIP"], createdBy: user["produccion2@planta.com"] });
  const c5_comp003 = await compUpsert({ manufacturingOrderId: of5.id, productId: prod["COMP-003"], origin: ComponentOrigin.LISTA_MATERIALES, qtyRequired: 2, qtyServed: 0, qtyConsumed: 0, status: "SOLICITADO", createdBy: user["produccion2@planta.com"] });
  const c5_util003 = await compUpsert({ manufacturingOrderId: of5.id, productId: prod["UTIL-003"], origin: ComponentOrigin.UTILLAJE,         qtyRequired: 1, qtyServed: 0, qtyConsumed: 0, status: "SOLICITADO", createdBy: user["produccion2@planta.com"] });

  const totalComps = await prisma.oFComponent.count();
  console.log(`  ✓ ${totalComps} Componentes de OF`);

  // ── 10. SOLICITUDES Y LÍNEAS ──────────────────────────────���─────────────────
  const reqUpsert = async (requestNumber: string, data: Parameters<typeof prisma.materialRequest.create>[0]["data"]) => {
    return prisma.materialRequest.upsert({ where: { requestNumber }, update: {}, create: { requestNumber, ...data } as Parameters<typeof prisma.materialRequest.create>[0]["data"] });
  };

  // SOL-005001: OF-000001 → LOGISTICA — COMPLETADA (3 líneas servidas)
  const sol1 = await reqUpsert("SOL-005001", {
    requestNumber: "SOL-005001", manufacturingOrderId: of1.id, destinationAreaId: area["LOGISTICA"],
    status: RequestStatus.COMPLETADA, priority: "NORMAL",
    createdBy: user["produccion1@planta.com"], sentAt: d(-1), completedAt: d(-1),
  });
  const lineUpsert = async (data: Parameters<typeof prisma.requestLine.create>[0]["data"]) => {
    const ex = await prisma.requestLine.findFirst({ where: { materialRequestId: data.materialRequestId as number, ofComponentId: data.ofComponentId as number } });
    if (ex) return ex;
    return prisma.requestLine.create({ data });
  };
  const l1_comp001 = await lineUpsert({ materialRequestId: sol1.id, ofComponentId: c1_comp001.id, qtyRequested: 4, qtyServed: 4, fromLocationId: loc["ALM-COMP"], toLocationId: loc["PROD-WIP"], status: LineStatus.COMPLETADA, servedBy: user["logistica1@planta.com"], servedAt: d(-1) });
  const l1_comp006 = await lineUpsert({ materialRequestId: sol1.id, ofComponentId: c1_comp006.id, qtyRequested: 8, qtyServed: 8, fromLocationId: loc["ALM-COMP"], toLocationId: loc["PROD-WIP"], status: LineStatus.COMPLETADA, servedBy: user["logistica1@planta.com"], servedAt: d(-1) });
  const l1_util001 = await lineUpsert({ materialRequestId: sol1.id, ofComponentId: c1_util001.id, qtyRequested: 1, qtyServed: 1, fromLocationId: loc["ALM-UTIL"], toLocationId: loc["PROD-WIP"], status: LineStatus.COMPLETADA, servedBy: user["logistica1@planta.com"], servedAt: d(-1) });

  // SOL-005002: OF-000001 → LOGISTICA — ENVIADA (COMP-004 pendiente)
  const sol2 = await reqUpsert("SOL-005002", {
    requestNumber: "SOL-005002", manufacturingOrderId: of1.id, destinationAreaId: area["LOGISTICA"],
    status: RequestStatus.ENVIADA, priority: "ALTA",
    createdBy: user["produccion1@planta.com"], sentAt: d(0),
  });
  await lineUpsert({ materialRequestId: sol2.id, ofComponentId: c1_comp004.id, qtyRequested: 32, qtyServed: 0, fromLocationId: loc["ALM-COMP"], toLocationId: loc["SUP-A"], status: LineStatus.ENVIADA });

  // SOL-005003: OF-000002 → LOGISTICA — EN_PROCESO (MP-001 y COMP-002, parcialmente servidos)
  const sol3 = await reqUpsert("SOL-005003", {
    requestNumber: "SOL-005003", manufacturingOrderId: of2.id, destinationAreaId: area["LOGISTICA"],
    status: RequestStatus.EN_PROCESO, priority: "NORMAL",
    createdBy: user["produccion2@planta.com"], sentAt: d(-2),
  });
  const l3_mp001   = await lineUpsert({ materialRequestId: sol3.id, ofComponentId: c2_mp001.id,   qtyRequested: 3, qtyServed: 1, fromLocationId: loc["ALM-GEN"],  toLocationId: loc["PROD-WIP"], status: LineStatus.PARCIALMENTE_SERVIDA, servedBy: user["logistica2@planta.com"], servedAt: d(-1) });
  const l3_comp002 = await lineUpsert({ materialRequestId: sol3.id, ofComponentId: c2_comp002.id, qtyRequested: 6, qtyServed: 0, fromLocationId: loc["ALM-COMP"], toLocationId: loc["PROD-WIP"], status: LineStatus.ENVIADA });

  // SOL-005004: OF-000002 → LOGISTICA — ENVIADA (COMP-007)
  const sol4 = await reqUpsert("SOL-005004", {
    requestNumber: "SOL-005004", manufacturingOrderId: of2.id, destinationAreaId: area["LOGISTICA"],
    status: RequestStatus.ENVIADA, priority: "URGENTE",
    createdBy: user["produccion2@planta.com"], sentAt: d(0),
  });
  await lineUpsert({ materialRequestId: sol4.id, ofComponentId: c2_comp007.id, qtyRequested: 6, qtyServed: 0, fromLocationId: loc["ALM-COMP"], toLocationId: loc["PROD-WIP"], status: LineStatus.ENVIADA });

  // SOL-005005: OF-000004 → LOGISTICA — COMPLETADA (histórico)
  const sol5 = await reqUpsert("SOL-005005", {
    requestNumber: "SOL-005005", manufacturingOrderId: of4.id, destinationAreaId: area["LOGISTICA"],
    status: RequestStatus.COMPLETADA, priority: "NORMAL",
    createdBy: user["produccion1@planta.com"], sentAt: d(-6), completedAt: d(-5),
  });
  const l5_semi001 = await lineUpsert({ materialRequestId: sol5.id, ofComponentId: c4_semi001.id, qtyRequested: 3, qtyServed: 3, fromLocationId: loc["ALM-COMP"], toLocationId: loc["PROD-WIP"], status: LineStatus.COMPLETADA, servedBy: user["logistica1@planta.com"], servedAt: d(-5) });
  const l5_mp002   = await lineUpsert({ materialRequestId: sol5.id, ofComponentId: c4_mp002.id,   qtyRequested: 6, qtyServed: 6, fromLocationId: loc["ALM-GEN"],  toLocationId: loc["PROD-WIP"], status: LineStatus.COMPLETADA, servedBy: user["logistica1@planta.com"], servedAt: d(-5) });

  // SOL-005006: OF-000005 → APQ — ENVIADA
  const sol6 = await reqUpsert("SOL-005006", {
    requestNumber: "SOL-005006", manufacturingOrderId: of5.id, destinationAreaId: area["APQ"],
    status: RequestStatus.ENVIADA, priority: "ALTA",
    createdBy: user["produccion2@planta.com"], sentAt: d(0),
  });
  await lineUpsert({ materialRequestId: sol6.id, ofComponentId: c5_comp003.id, qtyRequested: 2, qtyServed: 0, status: LineStatus.ENVIADA });

  // SOL-005007: OF-000005 → MONTAJE — ENVIADA
  const sol7 = await reqUpsert("SOL-005007", {
    requestNumber: "SOL-005007", manufacturingOrderId: of5.id, destinationAreaId: area["MONTAJE"],
    status: RequestStatus.ENVIADA, priority: "NORMAL",
    createdBy: user["produccion2@planta.com"], sentAt: d(0),
  });
  await lineUpsert({ materialRequestId: sol7.id, ofComponentId: c5_util003.id, qtyRequested: 1, qtyServed: 0, status: LineStatus.ENVIADA });

  // SOL-005008: OF-000005 → LOGISTICA — COMPLETADA (COMP-002 ya servido)
  const sol8 = await reqUpsert("SOL-005008", {
    requestNumber: "SOL-005008", manufacturingOrderId: of5.id, destinationAreaId: area["LOGISTICA"],
    status: RequestStatus.COMPLETADA, priority: "NORMAL",
    createdBy: user["produccion2@planta.com"], sentAt: d(-1), completedAt: d(-1),
  });
  const l8_comp002 = await lineUpsert({ materialRequestId: sol8.id, ofComponentId: c5_comp002.id, qtyRequested: 4, qtyServed: 4, fromLocationId: loc["ALM-COMP"], toLocationId: loc["PROD-WIP"], status: LineStatus.COMPLETADA, servedBy: user["logistica2@planta.com"], servedAt: d(-1) });

  const totalReqs = await prisma.materialRequest.count();
  const totalLines = await prisma.requestLine.count();
  console.log(`  ✓ ${totalReqs} Solicitudes | ${totalLines} Líneas`);

  // ── 11. MOVIMIENTOS DE STOCK ─────────────────────────────────��──────────────
  const movUpsert = async (data: Parameters<typeof prisma.stockMovement.create>[0]["data"]) => {
    const ex = await prisma.stockMovement.findFirst({
      where: { refRequestLineId: data.refRequestLineId as number, movementType: data.movementType },
    });
    if (ex) return ex;
    return prisma.stockMovement.create({ data });
  };

  // Traspasos para SOL-005001 (COMPLETADA)
  const mv1 = await movUpsert({ movementType: MovementType.TRASPASO, productId: prod["COMP-001"], fromLocationId: loc["ALM-COMP"], toLocationId: loc["PROD-WIP"], qty: 4, refOfComponentId: c1_comp001.id, refRequestLineId: l1_comp001.id, userId: user["logistica1@planta.com"] });
  const mv2 = await movUpsert({ movementType: MovementType.TRASPASO, productId: prod["COMP-006"], fromLocationId: loc["ALM-COMP"], toLocationId: loc["PROD-WIP"], qty: 8, refOfComponentId: c1_comp006.id, refRequestLineId: l1_comp006.id, userId: user["logistica1@planta.com"] });
  const mv3 = await movUpsert({ movementType: MovementType.TRASPASO, productId: prod["UTIL-001"], fromLocationId: loc["ALM-UTIL"], toLocationId: loc["PROD-WIP"], qty: 1, refOfComponentId: c1_util001.id, refRequestLineId: l1_util001.id, userId: user["logistica1@planta.com"] });

  // Consumos parciales de OF-000001
  const mv4 = await movUpsert({ movementType: MovementType.CONSUMO, productId: prod["COMP-001"], fromLocationId: loc["PROD-WIP"], qty: 2, refOfComponentId: c1_comp001.id, userId: user["produccion1@planta.com"] });
  const mv5 = await movUpsert({ movementType: MovementType.CONSUMO, productId: prod["COMP-006"], fromLocationId: loc["PROD-WIP"], qty: 8, refOfComponentId: c1_comp006.id, userId: user["produccion1@planta.com"] });

  // Traspaso parcial SOL-005003 (MP-001, 1 unidad servida)
  await movUpsert({ movementType: MovementType.TRASPASO, productId: prod["MP-001"], fromLocationId: loc["ALM-GEN"], toLocationId: loc["PROD-WIP"], qty: 1, refOfComponentId: c2_mp001.id, refRequestLineId: l3_mp001.id, userId: user["logistica2@planta.com"] });

  // Traspasos SOL-005005 (COMPLETADA, OF-000004)
  await movUpsert({ movementType: MovementType.TRASPASO, productId: prod["SEMI-001"], fromLocationId: loc["ALM-COMP"], toLocationId: loc["PROD-WIP"], qty: 3, refOfComponentId: c4_semi001.id, refRequestLineId: l5_semi001.id, userId: user["logistica1@planta.com"] });
  await movUpsert({ movementType: MovementType.TRASPASO, productId: prod["MP-002"],   fromLocationId: loc["ALM-GEN"],  toLocationId: loc["PROD-WIP"], qty: 6, refOfComponentId: c4_mp002.id,   refRequestLineId: l5_mp002.id,   userId: user["logistica1@planta.com"] });

  // Consumos OF-000004
  await movUpsert({ movementType: MovementType.CONSUMO, productId: prod["SEMI-001"], fromLocationId: loc["PROD-WIP"], qty: 3, refOfComponentId: c4_semi001.id, userId: user["produccion1@planta.com"] });
  await movUpsert({ movementType: MovementType.CONSUMO, productId: prod["MP-002"],   fromLocationId: loc["PROD-WIP"], qty: 6, refOfComponentId: c4_mp002.id,   userId: user["produccion1@planta.com"] });

  // Traspaso SOL-005008 (OF-000005 COMP-002)
  await movUpsert({ movementType: MovementType.TRASPASO, productId: prod["COMP-002"], fromLocationId: loc["ALM-COMP"], toLocationId: loc["PROD-WIP"], qty: 4, refOfComponentId: c5_comp002.id, refRequestLineId: l8_comp002.id, userId: user["logistica2@planta.com"] });

  const totalMovs = await prisma.stockMovement.count();
  console.log(`  ✓ ${totalMovs} Movimientos de stock`);

  // ── 12. SALDOS DE STOCK (estado actual, tras movimientos) ───────────────────
  const sbUpsert = async (productId: number, locationId: number, qtyAvailable: number) => {
    return prisma.stockBalance.upsert({
      where:  { productId_locationId: { productId, locationId } },
      update: { qtyAvailable },
      create: { productId, locationId, qtyAvailable },
    });
  };

  await Promise.all([
    // Almacén de componentes (tras traspasos realizados)
    sbUpsert(prod["COMP-001"], loc["ALM-COMP"], 21),   // 25 - 4
    sbUpsert(prod["COMP-002"], loc["ALM-COMP"], 46),   // 50 - 4
    sbUpsert(prod["COMP-003"], loc["ALM-COMP"], 30),
    sbUpsert(prod["COMP-004"], loc["ALM-COMP"], 500),
    sbUpsert(prod["COMP-005"], loc["ALM-COMP"], 500),
    sbUpsert(prod["COMP-006"], loc["ALM-COMP"], 32),   // 40 - 8
    sbUpsert(prod["COMP-007"], loc["ALM-COMP"], 20),
    sbUpsert(prod["SEMI-001"], loc["ALM-COMP"], 5),    // 8 - 3
    sbUpsert(prod["SEMI-002"], loc["ALM-COMP"], 12),   // faltante para OF-000001 (stock existe pero OF necesita 2)
    // Almacén general
    sbUpsert(prod["MP-001"],   loc["ALM-GEN"],  14),   // 15 - 1
    sbUpsert(prod["MP-002"],   loc["ALM-GEN"],  74),   // 80 - 6
    sbUpsert(prod["MP-003"],   loc["ALM-GEN"],  60),
    // Almacén utillajes
    sbUpsert(prod["UTIL-001"], loc["ALM-UTIL"],  2),   // 3 - 1
    sbUpsert(prod["UTIL-002"], loc["ALM-UTIL"],  5),
    sbUpsert(prod["UTIL-003"], loc["ALM-UTIL"],  4),
    // Supermarket línea A
    sbUpsert(prod["COMP-001"], loc["SUP-A"],     5),
    sbUpsert(prod["COMP-004"], loc["SUP-A"],   100),
    sbUpsert(prod["COMP-005"], loc["SUP-A"],   100),
    sbUpsert(prod["COMP-006"], loc["SUP-A"],     8),
    // WIP planta (en curso)
    sbUpsert(prod["COMP-001"], loc["PROD-WIP"],  2),   // 4 servidos - 2 consumidos
    sbUpsert(prod["COMP-002"], loc["PROD-WIP"],  4),   // OF-000005 servido, no consumido
    sbUpsert(prod["UTIL-001"], loc["PROD-WIP"],  1),
    sbUpsert(prod["MP-001"],   loc["PROD-WIP"],  1),   // parcialmente servido OF-000002
  ]);
  const totalSb = await prisma.stockBalance.count();
  console.log(`  ✓ ${totalSb} Saldos de stock`);

  // ── 13. FALTANTES ───────────────────────────────────────────────────��──────
  const existingShortage = await prisma.componentShortage.findFirst({ where: { ofComponentId: c1_semi002.id } });
  if (!existingShortage) {
    await prisma.componentShortage.create({
      data: {
        ofComponentId: c1_semi002.id,
        qtyShortage:   2,
        detectedBy:    user["produccion1@planta.com"],
        notes:         "SEMI-002 no disponible en almacén en la fecha requerida",
      },
    });
  }
  const totalShortages = await prisma.componentShortage.count();
  console.log(`  ✓ ${totalShortages} Faltantes`);

  console.log("\n✅ Seed completo.\n");
  console.log("  OFs activas:     4 (EN_CURSO, LANZADA×2, PLANIFICADA)");
  console.log("  Solicitudes:     8 (Logística×5, APQ×1, Montaje×1, históricas×2)");
  console.log("  Movimientos:    11 (traspasos + consumos)");
  console.log("  Faltantes:       1 (SEMI-002 en OF-000001)\n");
}

main()
  .catch((e) => { console.error("❌ Error en seed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
