export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
        Travel Planner
      </h1>
      <p className="text-lg leading-8 text-slate-300">
        Iniciando la plataforma colaborativa para el viaje a Bogotá 2026.
      </p>
      {/* Indicador de estado del sistema UI base */}
      <div className="rounded-md bg-blue-900/50 px-4 py-2 mt-8 border border-blue-800">
        <p className="text-sm text-blue-200">Fase 1: Infraestructura Core Lista</p>
      </div>
    </div>
  )
}