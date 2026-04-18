"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const DEMO_USER = "montaje1@planta.com";

async function getUser() {
  const u = await prisma.appUser.findUnique({ where: { email: DEMO_USER } });
  if (!u) throw new Error("Usuario demo no encontrado");
  return u;
}

export async function confirmarServicioMontaje(formData: FormData) {
  const lineId    = Number(formData.get("lineId"));
  const requestId = Number(formData.get("requestId"));
  const user      = await getUser();

  await prisma.$transaction(async (tx) => {
    const line = await tx.requestLine.findUnique({
      where: { id: lineId }, include: { ofComponent: true },
    });
    if (!line) throw new Error("Línea no encontrada");

    await tx.requestLine.update({
      where: { id: lineId },
      data:  { qtyServed: line.qtyRequested, status: "COMPLETADA", servedBy: user.id, servedAt: new Date() },
    });

    const newQtyServed = Number(line.ofComponent.qtyServed) + Number(line.qtyRequested);
    const compComplete = newQtyServed >= Number(line.ofComponent.qtyRequired);
    await tx.oFComponent.update({
      where: { id: line.ofComponentId },
      data:  { qtyServed: newQtyServed, status: compComplete ? "SERVIDO" : "PARCIALMENTE_SERVIDO", updatedBy: user.id },
    });

    const allLines = await tx.requestLine.findMany({ where: { materialRequestId: requestId } });
    const allDone  = allLines.every(l => l.id === lineId || l.status === "COMPLETADA");
    if (allDone) {
      await tx.materialRequest.update({
        where: { id: requestId },
        data:  { status: "COMPLETADA", completedAt: new Date(), updatedBy: user.id },
      });
    }
  });

  revalidatePath(`/montaje/${requestId}`);
  revalidatePath("/montaje");
}
