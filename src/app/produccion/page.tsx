import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OFStatus } from "@prisma/client";

const STATUS_LABEL: Record<OFStatus, string> = {
  PLANIFICADA:  "Planificada",
  LANZADA:      "Lanzada",
  EN_CURSO:     "En curso",
  COMPLETADA:   "Completada",
  CERRADA:      "Cerrada",
  CANCELADA:    "Cancelada",
};

const STATUS_COLOR: Record<OFStatus, string> = {
  PLANIFICADA:  "bg-gray-100 text-gray-700",
  LANZADA:      "bg-blue-100 text-blue-700",
  EN_CURSO:     "bg-amber-100 text-amber-700",
  COMPLETADA:   "bg-green-100 text-green-700",
  CERRADA:      "bg-slate-100 text-slate-500",
  CANCELADA:    "bg-red-100 text-red-600",
};

const ACTIVE_STATUSES: OFStatus[] = ["PLANIFICADA", "LANZADA", "EN_CURSO"];

async function getOrders() {
  return prisma.manufacturingOrder.findMany({
    where:   { status: { in: ACTIVE_STATUSES } },
    orderBy: { plannedStartAt: "asc" },
    include: {
      machineCenter: { include: { workCenter: true } },
      components: { select: { status: true } },
    },
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function ProduccionPage() {
  const orders = await getOrders();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Producción</h1>
          <p className="text-sm text-gray-500">Órdenes de fabricación activas</p>
        </div>
        <Link
          href="/produccion/nueva"
          className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva OF
        </Link>
      </header>

      <main className="flex-1 p-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg font-medium">Sin órdenes activas</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl mx-auto">
            {orders.map((of) => {
              const pending  = of.components.filter(c => c.status === "PENDIENTE").length;
              const shortage = of.components.filter(c => c.status === "FALTANTE").length;
              const total    = of.components.length;

              return (
                <Link
                  key={of.id}
                  href={`/produccion/${of.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-gray-900">{of.ofNumber}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[of.status]}`}>
                          {STATUS_LABEL[of.status]}
                        </span>
                        {shortage > 0 && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                            {shortage} faltante{shortage > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">{of.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{of.machineCenter.workCenter.description} · {of.machineCenter.description}</span>
                        <span>Inicio: {formatDate(of.plannedStartAt)}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-gray-800">{total}</p>
                      <p className="text-xs text-gray-400">componentes</p>
                      {pending > 0 && (
                        <p className="text-xs text-amber-600 font-medium mt-1">{pending} pendientes</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
