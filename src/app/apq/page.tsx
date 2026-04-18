import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { RequestStatusBadge, PriorityBadge } from "@/components/Badge";
import type { RequestStatus } from "@prisma/client";

const ACTIVE: RequestStatus[] = ["ENVIADA", "EN_PROCESO", "PARCIALMENTE_SERVIDA"];

async function getRequests() {
  return prisma.materialRequest.findMany({
    where:   { destinationArea: { code: "APQ" }, status: { in: ACTIVE } },
    orderBy: [{ priority: "asc" }, { sentAt: "asc" }],
    include: {
      manufacturingOrder: { include: { machineCenter: true } },
      lines: { select: { status: true } },
    },
  });
}

function timeAgo(date: Date | null) {
  if (!date) return "";
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (mins < 60)   return `hace ${mins}m`;
  if (mins < 1440) return `hace ${Math.floor(mins / 60)}h`;
  return `hace ${Math.floor(mins / 1440)}d`;
}

export default async function APQPage() {
  const requests = await getRequests();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader back="/" title="APQ" subtitle="Solicitudes de servicio pendientes" />

      <main className="flex-1 p-6">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg font-medium">Sin solicitudes activas</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            {requests.map(req => {
              const total   = req.lines.length;
              const done    = req.lines.filter(l => l.status === "COMPLETADA").length;
              const pending = total - done;
              return (
                <Link
                  key={req.id}
                  href={`/apq/${req.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-gray-900">{req.requestNumber}</span>
                        <RequestStatusBadge status={req.status} />
                        <PriorityBadge priority={req.priority} />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {req.manufacturingOrder.ofNumber} · {req.manufacturingOrder.machineCenter.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(req.sentAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-gray-800">{pending}</p>
                      <p className="text-xs text-gray-400">pendientes</p>
                      {done > 0 && <p className="text-xs text-green-600 mt-1">{done} completadas</p>}
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
