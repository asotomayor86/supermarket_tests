"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const DEMO_USER = "logistica1@planta.com";

async function getUser() {
  const u = await prisma.appUser.findUnique({ where: { email: DEMO_USER } });
  if (!u) throw new Error("Usuario demo no encontrado");
  return u;
}

export async function confirmarLinea(formData: FormData) {
  const lineId         = Number(formData.get("lineId"));
  const qtyServed      = Number(formData.get("qtyServed"));
  const fromLocationId = Number(formData.get("fromLocationId"));
  const toLocationId   = Number(formData.get("toLocationId"));
  const requestId      = Number(formData.get("requestId"));
  const user           = await getUser();

  if (qtyServed <= 0) return;

  await prisma.$transaction(async (tx) => {
    const line = await tx.requestLine.findUnique({
      where:   { id: lineId },
      include: { ofComponent: true },
    });
    if (!line) throw new Error("Línea no encontrada");

    // Stock balance: decrement origin, increment destination
    await tx.stockBalance.updateMany({
      where: { productId: line.ofComponent.productId, locationId: fromLocationId },
      data:  { qtyAvailable: { decrement: qtyServed } },
    });
    await tx.stockBalance.upsert({
      where:  { productId_locationId: { productId: line.ofComponent.productId, locationId: toLocationId } },
      update: { qtyAvailable: { increment: qtyServed } },
      create: { productId: line.ofComponent.productId, locationId: toLocationId, qtyAvailable: qtyServed },
    });

    // Stock movement
    await tx.stockMovement.create({
      data: {
        movementType:     "TRASPASO",
        productId:        line.ofComponent.productId,
        fromLocationId,
        toLocationId,
        qty:              qtyServed,
        refOfComponentId: line.ofComponentId,
        refRequestLineId: lineId,
        userId:           user.id,
      },
    });

    // Update request line
    const newLineQty = Number(line.qtyServed) + qtyServed;
    const lineComplete = newLineQty >= Number(line.qtyRequested);
    await tx.requestLine.update({
      where: { id: lineId },
      data:  {
        qtyServed:       newLineQty,
        fromLocationId,
        toLocationId,
        status:          lineComplete ? "COMPLETADA" : "PARCIALMENTE_SERVIDA",
        servedBy:        user.id,
        servedAt:        new Date(),
      },
    });

    // Update OF component
    const newCompQty = Number(line.ofComponent.qtyServed) + qtyServed;
    const compComplete = newCompQty >= Number(line.ofComponent.qtyRequired);
    await tx.oFComponent.update({
      where: { id: line.ofComponentId },
      data:  {
        qtyServed:  newCompQty,
        status:     compComplete ? "SERVIDO" : "PARCIALMENTE_SERVIDO",
        locationId: toLocationId,
        updatedBy:  user.id,
      },
    });

    // Check if all lines in the request are complete
    const allLines = await tx.requestLine.findMany({ where: { materialRequestId: requestId } });
    const allDone  = allLines.every(l => l.id === lineId ? lineComplete : l.status === "COMPLETADA");
    if (allDone) {
      await tx.materialRequest.update({
        where: { id: requestId },
        data:  { status: "COMPLETADA", completedAt: new Date(), updatedBy: user.id },
      });
    } else {
      await tx.materialRequest.update({
        where: { id: requestId },
        data:  { status: "EN_PROCESO", updatedBy: user.id },
      });
    }
  });

  revalidatePath(`/logistica/${requestId}`);
  revalidatePath("/logistica");
}
