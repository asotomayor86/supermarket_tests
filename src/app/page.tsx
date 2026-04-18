import Link from "next/link";

const areas = [
  {
    code: "produccion",
    label: "Producción",
    description: "Órdenes de fabricación y componentes",
    color: "bg-blue-600 hover:bg-blue-700",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m5.8-1.878a4.5 4.5 0 0 0-6.364-6.364" />
      </svg>
    ),
  },
  {
    code: "logistica",
    label: "Logística",
    description: "Solicitudes y traspasos de stock",
    color: "bg-emerald-600 hover:bg-emerald-700",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    ),
  },
  {
    code: "apq",
    label: "APQ",
    description: "Confirmación de servicios APQ",
    color: "bg-violet-600 hover:bg-violet-700",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    code: "montaje",
    label: "Montaje",
    description: "Confirmación de servicios Montaje",
    color: "bg-orange-600 hover:bg-orange-700",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Supermarket Planta</h1>
        <p className="text-sm text-gray-500">Selecciona tu área de trabajo</p>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {areas.map((area) => (
            <Link
              key={area.code}
              href={`/${area.code}`}
              className={`${area.color} text-white rounded-2xl p-8 flex flex-col gap-4 transition-colors shadow-sm`}
            >
              {area.icon}
              <div>
                <p className="text-2xl font-bold">{area.label}</p>
                <p className="text-sm opacity-80 mt-1">{area.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
