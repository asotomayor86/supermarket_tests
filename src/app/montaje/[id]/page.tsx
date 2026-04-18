import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { RequestStatusBadge, LineStatusBadge, PriorityBadge } from "@/components/Badge";
import { confirmarServicioMontaje } from "@/lib/actions/montaje";

async function getRequest(id: number) {
  return prisma.materialRequest.findUnique({
    where: { id },
    include: {
      manufacturingOrder: { include: { machineCenter: { include: { workCenter: true } } } },
      lines: {
        include: { ofComponent: { include: { product: { include: { uom: true } } } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

function qty(v: unknown) { return Number(v); }

export default async function MontajeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await getRequest(Number(id));
  if (!request) notFound();

  const of = request.manufacturingOrder;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader
        back="/montaje"
        title={request.requestNumber}
        subtitle={`${of.ofNumber} · ${of.machineCenter.description}`}
        right={
          <div className="flex items-center gap-2">
            <PriorityBadge priority={request.priority} />
            <RequestStatusBadge status={request.status} />
          </div>
        }
      />

      <div className="bg-white border-b border-gray-100 px-6 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
        <span><span className="text-gray-400">OF:</span> {of.ofNumber}</span>
        <span><span className="text-gray-400">Máquina:</span> {of.machineCenter.description}</span>
        <span><span className="text-gray-400">CT:</span> {of.machineCenter.workCenter.description}</span>
      </div>

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {request.lines.map(line => {
            const isEditable = line.status !== "COMPLETADA" && line.status !== "CANCELADA";
            const product    = line.ofComponent.product;

            return (
              <div
                key={line.id}
                className={`bg-white rounded-xl border p-5 flex items-center justify-between gap-4 ${
                  line.status === "COMPLETADA" ? "border-green-200 opacity-75" : "border-gray-200"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-gray-800">{product.code}</span>
                    <LineStatusBadge status={line.status} />
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{product.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Solicitado: <strong className="text-gray-700">{qty(line.qtyRequested)} {product.uom.code}</strong>
                  </p>
                </div>

                <div className="shrink-0">
                  {isEditable ? (
                    <form action={confirmarServicioMontaje}>
                      <input type="hidden" name="lineId"    value={line.id} />
                      <input type="hidden" name="requestId" value={request.id} />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Confirmar
                      </button>
                    </form>
                  ) : (
                    <span className="text-sm text-green-600 font-medium">✓ Confirmado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
