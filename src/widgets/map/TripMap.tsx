'use client'

import dynamic from 'next/dynamic'

// Definimos lo que el mapa va a recibir
type MapProps = {
  activities: { id: string, lat: number, lng: number, title: string, isPending: boolean }[]
}

const Map = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-900 border border-slate-800 rounded-2xl animate-pulse flex items-center justify-center text-slate-500">
      Cargando motor geoespacial libre...
    </div>
  )
})

export function TripMap({ activities = [] }: MapProps) {
  return (
    <div className="rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative z-0">
      <Map activities={activities} />
    </div>
  )
}