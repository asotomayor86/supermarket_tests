"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEMO_USER = "produccion1@planta.com";

async function getUser() {
  const u = await prisma.appUser.findUnique({ where: { email: DEMO_USER } });
  if (!u) throw new Error("Usuario demo no encontrado");
  return u;
}

async function nextRequestNumber(): Promise<string> {
  const last = await prisma.materialRequest.findFirst({ orderBy: { id: "desc" }, select: { id: true } });
  return `SOL-${String((last?.id ?? 0) + 1).padStart(6, "0")}`;
}

async function nextOFNumber(): Promise<string> {
  const last = await prisma.manufacturingOrder.findFirst({ orderBy: { id: "desc" }, select: { id: true } });
  return `OF-${String((last?.id ?? 0) + 1).padStart(6, "0")}`;
}

export async function crearOrden(formData: FormData) {
  const targetProductId = Number(formData.get("targetProductId"));
  const qtyPlanned      = Number(formData.get("qtyPlanned"));
  const machineCenterId = Number(formData.get("machineCenterId"));
  const plannedStartAt  = new Date(formData.get("plannedStartAt") as string);
  const plannedEndAtStr = formData.get("plannedEndAt") as string;
  const notes           = (formData.get("notes") as string).trim();
  const user            = await getUser();

  const product  = await prisma.product.findUnique({ where: { id: targetProductId }, include: { uom: true } });
  const ofNumber = await nextOFNumber();

  const description = notes || `${product?.description ?? "—"} × ${qtyPlanned} ${product?.uom.code ?? ""}`;

  const data: Prisma.ManufacturingOrderUncheckedCreateInput = {
    ofNumber,
    description,
    machineCenterId,
    targetProductId,
    qtyPlanned,
    plannedStartAt,
    plannedEndAt: plannedEndAtStr ? new Date(plannedEndAtStr) : undefined,
    status:       "PLANIFICADA",
    createdBy:    user.id,
  };

  const of = await prisma.manufacturingOrder.create({ data });

  revalidatePath("/produccion");
  redirect(`/produccion/${of.id}`);
}

export async function verificarComponente(formData: FormData) {
  const componentId = Number(formData.get("componentId"));
  const ofId        = Number(formData.get("ofId"));
  const user        = await getUser();

  await prisma.oFComponent.update({
    where: { id: componentId },
    data:  { status: "VERIFICADO", verifiedBy: user.id, verifiedAt: new Date(), updatedBy: user.id },
  });

  revalidatePath(`/produccion/${ofId}`);
}

export async function enviarSolicitud(formData: FormData) {
  const componentId = Number(formData.get("componentId"));
  const ofId        = Number(formData.get("ofId"));
  const areaCode    = formData.get("area") as string;
  const qty         = Number(formData.get("qty"));
  const user        = await getUser();

  const area = await prisma.area.findUnique({ where: { code: areaCode as "LOGISTICA" | "APQ" | "MONTAJE" } });
  if (!area) throw new Error("Área no encontrada");

  const requestNumber = await nextRequestNumber();

  await prisma.materialRequest.create({
    data: {
      requestNumber,
      manufacturingOrderId: ofId,
      destinationAreaId:    area.id,
      status:               "ENVIADA",
      priority:             "NORMAL",
      createdBy:            user.id,
      sentAt:               new Date(),
      lines: {
        create: {
          ofComponentId: componentId,
          qtyRequested:  qty,
          status:        "ENVIADA",
        },
      },
    },
  });

  await prisma.oFComponent.update({
    where: { id: componentId },
    data:  { status: "SOLICITADO", updatedBy: user.id },
  });

  revalidatePath(`/produccion/${ofId}`);
  revalidatePath(`/${areaCode.toLowerCase()}`);
}

export async function consumirComponente(formData: FormData) {
  const componentId = Number(formData.get("componentId"));
  const ofId        = Number(formData.get("ofId"));
  const qty         = Number(formData.get("qty"));
  const user        = await getUser();

  const component = await prisma.oFComponent.findUnique({
    where:   { id: componentId },
    include: { location: true },
  });
  if (!component) throw new Error("Componente no encontrado");
  if (!["SERVIDO", "PARCIALMENTE_SERVIDO"].includes(component.status)) return;

  const newConsumed = Number(component.qtyConsumed) + qty;
  const newStatus   = newConsumed >= Number(component.qtyRequired) ? "CONSUMIDO" : "PARCIALMENTE_SERVIDO";

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        movementType:    "CONSUMO",
        productId:       component.productId,
        fromLocationId:  component.locationId ?? undefined,
        qty,
        refOfComponentId: componentId,
        userId:          user.id,
      },
    }),
    ...(component.locationId
      ? [prisma.stockBalance.updateMany({
          where: { productId: component.productId, locationId: component.locationId },
          data:  { qtyAvailable: { decrement: qty } },
        })]
      : []),
    prisma.oFComponent.update({
      where: { id: componentId },
      data:  { qtyConsumed: newConsumed, status: newStatus, updatedBy: user.id },
    }),
  ]);

  revalidatePath(`/produccion/${ofId}`);
}
