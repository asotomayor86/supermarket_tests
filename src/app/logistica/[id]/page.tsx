import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { RequestStatusBadge, LineStatusBadge, PriorityBadge } from "@/components/Badge";
import { confirmarLinea } from "@/lib/actions/logistica";

async function getRequest(id: number) {
  return prisma.materialRequest.findUnique({
    where: { id },
    include: {
      manufacturingOrder: { include: { machineCenter: { include: { workCenter: true } } } },
      destinationArea: true,
      lines: {
        include: {
          ofComponent: { include: { product: { include: { uom: true } } } },
          fromLocation: true,
          toLocation:   true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

async function getLocations() {
  return prisma.location.findMany({ where: { active: true }, orderBy: { code: "asc" } });
}

function qty(v: unknown) { return Number(v); }

export default async function LogisticaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [request, locations] = await Promise.all([getRequest(Number(id)), getLocations()]);
  if (!request) notFound();

  const of = request.manufacturingOrder;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader
        back="/logistica"
        title={request.requestNumber}
        subtitle={`${of.ofNumber} · ${of.machineCenter.description}`}
        right={
          <div className="flex items-center gap-2">
            <PriorityBadge priority={request.priority} />
            <RequestStatusBadge status={request.status} />
          </div>
        }
      />

      {/* OF info */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
        <span><span className="text-gray-400">OF:</span> {of.ofNumber}</span>
        <span><span className="text-gray-400">Máquina:</span> {of.machineCenter.description}</span>
        <span><span className="text-gray-400">CT:</span> {of.machineCenter.workCenter.description}</span>
      </div>

      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {request.lines.map(line => {
            const isEditable = ["ENVIADA", "PARCIALMENTE_SERVIDA", "EN_PROCESO"].includes(line.status);
            const qReq       = qty(line.qtyRequested);
            const qServed    = qty(line.qtyServed);
            const remaining  = Math.max(qReq - qServed, 0);
            const product    = line.ofComponent.product;

            return (
              <div
                key={line.id}
                className={`bg-white rounded-xl border p-5 ${
                  line.status === "COMPLETADA" ? "border-green-200 opacity-75" : "border-gray-200"
                }`}
              >
                {/* Product header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-gray-800">{product.code}</span>
                      <LineStatusBadge status={line.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{product.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Solicitado: <strong className="text-gray-700">{qReq} {product.uom.code}</strong>
                      {qServed > 0 && <> · Servido hasta ahora: <strong className="text-green-700">{qServed}</strong></>}
                      {remaining > 0 && <> · Pendiente: <strong className="text-amber-600">{remaining}</strong></>}
                    </p>
                  </div>
                </div>

                {/* Confirmation form (only if editable) */}
                {isEditable && (
                  <form action={confirmarLinea} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-3 border-t border-gray-100">
                    <input type="hidden" name="lineId"    value={line.id} />
                    <input type="hidden" name="requestId" value={request.id} />

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cantidad a servir</label>
                      <input
                        type="number" name="qtyServed"
                        min={0.0001} max={remaining} step="any"
                        defaultValue={remaining}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Ubicación origen</label>
                      <select
                        name="fromLocationId"
                        defaultValue={line.fromLocation?.id ?? ""}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      >
                        <option value="">— Seleccionar —</option>
                        {locations.map(l => (
                          <option key={l.id} value={l.id}>{l.code} – {l.description}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Ubicación destino</label>
                      <select
                        name="toLocationId"
                        defaultValue={line.toLocation?.id ?? ""}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      >
                        <option value="">— Seleccionar —</option>
                        {locations.map(l => (
                          <option key={l.id} value={l.id}>{l.code} – {l.description}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="w-full py-2 px-4 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Confirmar
                      </button>
                    </div>
                  </form>
                )}

                {line.status === "COMPLETADA" && (
                  <p className="text-sm text-green-600 font-medium mt-2 pt-3 border-t border-gray-100">
                    ✓ Servido — {line.fromLocation?.code} → {line.toLocation?.code}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
