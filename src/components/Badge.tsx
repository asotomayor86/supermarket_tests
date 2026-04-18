import type { OFStatus, ComponentStatus, RequestStatus, LineStatus, RequestPriority } from "@prisma/client";

type Color = "gray" | "blue" | "amber" | "green" | "red" | "slate" | "violet" | "orange" | "emerald";

const COLOR: Record<Color, string> = {
  gray:    "bg-gray-100 text-gray-700",
  blue:    "bg-blue-100 text-blue-700",
  amber:   "bg-amber-100 text-amber-700",
  green:   "bg-green-100 text-green-700",
  red:     "bg-red-100 text-red-600",
  slate:   "bg-slate-100 text-slate-500",
  violet:  "bg-violet-100 text-violet-700",
  orange:  "bg-orange-100 text-orange-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

const OF_STATUS: Record<OFStatus, { label: string; color: Color }> = {
  PLANIFICADA: { label: "Planificada",  color: "gray"   },
  LANZADA:     { label: "Lanzada",      color: "blue"   },
  EN_CURSO:    { label: "En curso",     color: "amber"  },
  COMPLETADA:  { label: "Completada",   color: "green"  },
  CERRADA:     { label: "Cerrada",      color: "slate"  },
  CANCELADA:   { label: "Cancelada",    color: "red"    },
};

const COMP_STATUS: Record<ComponentStatus, { label: string; color: Color }> = {
  PENDIENTE:            { label: "Pendiente",           color: "gray"    },
  VERIFICADO:           { label: "Verificado",          color: "blue"    },
  SOLICITADO:           { label: "Solicitado",          color: "violet"  },
  PARCIALMENTE_SERVIDO: { label: "Parcialmente servido",color: "amber"   },
  SERVIDO:              { label: "Servido",             color: "emerald" },
  CONSUMIDO:            { label: "Consumido",           color: "green"   },
  FALTANTE:             { label: "Faltante",            color: "red"     },
};

const REQ_STATUS: Record<RequestStatus, { label: string; color: Color }> = {
  BORRADOR:             { label: "Borrador",             color: "gray"   },
  ENVIADA:              { label: "Enviada",              color: "blue"   },
  EN_PROCESO:           { label: "En proceso",           color: "amber"  },
  PARCIALMENTE_SERVIDA: { label: "Parcial",              color: "orange" },
  COMPLETADA:           { label: "Completada",           color: "green"  },
  CANCELADA:            { label: "Cancelada",            color: "red"    },
};

const LINE_STATUS: Record<LineStatus, { label: string; color: Color }> = {
  ENVIADA:              { label: "Enviada",              color: "blue"   },
  EN_PROCESO:           { label: "En proceso",           color: "amber"  },
  PARCIALMENTE_SERVIDA: { label: "Parcial",              color: "orange" },
  COMPLETADA:           { label: "Completada",           color: "green"  },
  CANCELADA:            { label: "Cancelada",            color: "red"    },
};

const PRIORITY: Record<RequestPriority, { label: string; color: Color }> = {
  URGENTE: { label: "URGENTE", color: "red"   },
  ALTA:    { label: "Alta",    color: "orange"},
  NORMAL:  { label: "Normal",  color: "gray"  },
  BAJA:    { label: "Baja",    color: "slate" },
};

interface Props { className?: string }

export function OFStatusBadge({ status, className = "" }: { status: OFStatus } & Props) {
  const { label, color } = OF_STATUS[status];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLOR[color]} ${className}`}>{label}</span>;
}

export function ComponentStatusBadge({ status, className = "" }: { status: ComponentStatus } & Props) {
  const { label, color } = COMP_STATUS[status];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLOR[color]} ${className}`}>{label}</span>;
}

export function RequestStatusBadge({ status, className = "" }: { status: RequestStatus } & Props) {
  const { label, color } = REQ_STATUS[status];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLOR[color]} ${className}`}>{label}</span>;
}

export function LineStatusBadge({ status, className = "" }: { status: LineStatus } & Props) {
  const { label, color } = LINE_STATUS[status];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLOR[color]} ${className}`}>{label}</span>;
}

export function PriorityBadge({ priority, className = "" }: { priority: RequestPriority } & Props) {
  const { label, color } = PRIORITY[priority];
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${COLOR[color]} ${className}`}>{label}</span>;
}
