import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { OFStatusBadge, ComponentStatusBadge } from "@/components/Badge";
import { verificarComponente, enviarSolicitud, consumirComponente } from "@/lib/actions/produccion";
import type { ComponentStatus } from "@prisma/client";

async function getOF(id: number) {
  return prisma.manufacturingOrder.findUnique({
    where: { id },
    include: {
      machineCenter: { include: { workCenter: true } },
      components: {
        orderBy: [{ status: "asc" }, { createdAt: "asc" }],
        include: {
          product: {
            include: {
              uom: true,
              stockBalances: { include: { location: true } },
            },
          },
          location: true,
        },
      },
    },
  });
}

function fmt(d: Date) {
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function qty(v: unknown) { return Number(v); }

function StockInfo({ balances, locationCode }: {
  balances: { qtyAvailable: unknown; location: { code: string; description: string } }[];
  locationCode?: string | null;
}) {
  if (balances.length === 0) return <span className="text-gray-400">Sin stock registrado</span>;
  const preferred = locationCode ? balances.find(b => b.location.code === locationCode) : null;
  const shown = preferred
    ? [preferred, ...balances.filter(b => b.location.code !== locationCode).slice(0, 1)]
    : balances.slice(0, 2);
  return (
    <span className="text-xs text-gray-500 space-x-2">
      {shown.map(b => (
        <span key={b.location.code}>
          <span className="font-medium text-gray-700">{qty(b.qtyAvailable)}</span> en {b.location.code}
        </span>
      ))}
    </span>
  );
}

function ComponentActions({ component, ofId }: {
  component: { id: number; status: ComponentStatus; qtyRequired: unknown; qtyServed: unknown; qtyConsumed: unknown; product: { uom: { code: string } } };
  ofId: number;
}) {
  const s         = component.status as string;
  const pending   = qty(component.qtyRequired) - qty(component.qtyServed);
  const remaining = qty(component.qtyServed)   - qty(component.qtyConsumed);

  if (s === "PENDIENTE") {
    return (
      <form action={verificarComponente}>
        <input type="hidden" name="componentId" value={component.id} />
        <input type="hidden" name="ofId"         value={ofId} />
        <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
          Verificar
        </button>
      </form>
    );
  }

  if (s === "VERIFICADO" || s === "PARCIALMENTE_SERVIDO") {
    const qtyToRequest = Math.max(pending, 0);
    return (
      <div className="flex flex-wrap gap-1.5">
        {(["LOGISTICA", "APQ", "MONTAJE"] as const).map(a => (
          <form key={a} action={enviarSolicitud}>
            <input type="hidden" name="componentId" value={component.id} />
            <input type="hidden" name="ofId"         value={ofId} />
            <input type="hidden" name="area"         value={a} />
            <input type="hidden" name="qty"          value={qtyToRequest} />
            <button className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors">
              → {a === "LOGISTICA" ? "Log" : a === "APQ" ? "APQ" : "Mont"}
            </button>
          </form>
        ))}
      </div>
    );
  }

  if (s === "SERVIDO" && remaining > 0) {
    return (
      <form action={consumirComponente} className="flex items-center gap-1.5">
        <input type="hidden" name="componentId" value={component.id} />
        <input type="hidden" name="ofId"         value={ofId} />
        <input
          type="number" name="qty" min={1} max={remaining} defaultValue={remaining} step="any"
          className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-emerald-400"
        />
        <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
          Consumir
        </button>
      </form>
    );
  }

  if (s === "SOLICITADO") return <span className="text-xs text-violet-500 font-medium">En espera de servicio</span>;
  if (s === "CONSUMIDO")  return <span className="text-xs text-green-600 font-medium">✓ Consumido</span>;
  if (s === "FALTANTE")   return <span className="text-xs text-red-500 font-medium">⚠ Faltante</span>;
  return null;
}

export default async function OFDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const of = await getOF(Number(id));
  if (!of) notFound();

  const stats = {
    total:     of.components.length,
    pendiente: of.components.filter(c => c.status === "PENDIENTE").length,
    servido:   of.components.filter(c => ["SERVIDO", "CONSUMIDO"].includes(c.status)).length,
    faltante:  of.components.filter(c => c.status === "FALTANTE").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader
        back="/produccion"
        title={of.ofNumber}
        subtitle={of.description ?? undefined}
        right={<OFStatusBadge status={of.status} />}
      />

      {/* OF info bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
        <span><span className="text-gray-400">Máquina:</span> {of.machineCenter.description}</span>
        <span><span className="text-gray-400">CT:</span> {of.machineCenter.workCenter.description}</span>
        <span><span className="text-gray-400">Inicio:</span> {fmt(of.plannedStartAt)}</span>
        {of.plannedEndAt && <span><span className="text-gray-400">Fin:</span> {fmt(of.plannedEndAt)}</span>}
      </div>

      {/* Summary */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex gap-6 text-sm">
        <span className="text-gray-600">{stats.total} componentes</span>
        {stats.pendiente > 0 && <span className="text-amber-600">{stats.pendiente} pendientes</span>}
        {stats.servido   > 0 && <span className="text-green-600">{stats.servido} servidos/consumidos</span>}
        {stats.faltante  > 0 && <span className="text-red-600 font-medium">{stats.faltante} faltantes</span>}
      </div>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {of.components.map(comp => {
            const qRequired  = qty(comp.qtyRequired);
            const qServed    = qty(comp.qtyServed);
            const qConsumed  = qty(comp.qtyConsumed);
            const qPending   = Math.max(qRequired - qServed, 0);

            return (
              <div
                key={comp.id}
                className={`bg-white rounded-xl border px-5 py-4 ${
                  comp.status === "FALTANTE" ? "border-red-200" :
                  comp.status === "CONSUMIDO" ? "border-green-200 opacity-70" :
                  "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-gray-800">{comp.product.code}</span>
                      <ComponentStatusBadge status={comp.status} />
                      {comp.origin === "UTILLAJE" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Utillaje</span>
                      )}
                      {comp.origin === "ADICIONAL" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Adicional</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{comp.product.description}</p>

                    {/* Quantities */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-gray-500">
                      <span>Necesario: <strong className="text-gray-700">{qRequired} {comp.product.uom.code}</strong></span>
                      <span>Servido: <strong className="text-gray-700">{qServed}</strong></span>
                      <span>Consumido: <strong className="text-gray-700">{qConsumed}</strong></span>
                      {qPending > 0 && <span className="text-amber-600">Pendiente: <strong>{qPending}</strong></span>}
                    </div>

                    {/* Stock */}
                    <div className="mt-1.5">
                      <StockInfo balances={comp.product.stockBalances} locationCode={comp.location?.code} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center">
                    <ComponentActions component={comp} ofId={of.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
