import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { crearOrden } from "@/lib/actions/produccion";

async function getData() {
  const [products, machineCenters] = await Promise.all([
    prisma.product.findMany({
      where:   { active: true },
      orderBy: { code: "asc" },
      include: { uom: true },
    }),
    prisma.machineCenter.findMany({
      where:   { active: true },
      orderBy: { code: "asc" },
      include: { workCenter: true },
    }),
  ]);
  return { products, machineCenters };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function NuevaOFPage() {
  const { products, machineCenters } = await getData();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader back="/produccion" title="Nueva Orden de Fabricación" />

      <main className="flex-1 p-6">
        <div className="max-w-xl mx-auto">
          <form action={crearOrden} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

            {/* Producto a fabricar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Producto a fabricar <span className="text-red-500">*</span>
              </label>
              <select
                name="targetProductId"
                required
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="">— Seleccionar producto —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} ({p.uom.code}) — {p.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="qtyPlanned"
                required
                min="0.001"
                step="any"
                placeholder="0"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Centro de máquina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Centro de máquina <span className="text-red-500">*</span>
              </label>
              <select
                name="machineCenterId"
                required
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="">— Seleccionar máquina —</option>
                {machineCenters.map(mc => (
                  <option key={mc.id} value={mc.id}>
                    {mc.code} — {mc.description} ({mc.workCenter.description})
                  </option>
                ))}
              </select>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="plannedStartAt"
                  required
                  defaultValue={todayISO()}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha fin <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="date"
                  name="plannedEndAt"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Descripción / notas <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Se rellena automáticamente con producto × cantidad si se deja vacío"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Orden de Fabricación
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
