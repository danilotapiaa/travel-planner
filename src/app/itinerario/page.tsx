import { createClient } from '@/shared/api/supabase/server'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Music, Plane, Clock, CheckCircle2, Navigation, Footprints, Car } from 'lucide-react'
import { getTravelEstimates } from '@/features/routing/osrm'

export default async function ItineraryPage() {
  const supabase = await createClient()

  // Obtener actividades aprobadas
  const { data: approvedActivities } = await supabase
    .from('activities')
    .select('*')
    .eq('status', 'APROBADA')

  // Procesar rutas para actividades que tengan coordenadas
  const activitiesWithRoutes = await Promise.all(
    (approvedActivities || []).map(async (act) => {
      let routes = null
      if (act.latitude && act.longitude) {
        routes = await getTravelEstimates(act.latitude, act.longitude)
      }
      
      const actDate = act.start_time ? new Date(act.start_time) : new Date('2026-07-17T12:00:00')
      return {
        id: act.id,
        date: format(actDate, 'yyyy-MM-dd'),
        time: format(actDate, 'HH:mm'),
        title: act.title,
        description: act.place_id ? act.place_id.split(',')[0] : act.category,
        type: 'activity',
        routes
      }
    })
  )

  // Calcular ruta para el concierto (Movistar Arena)
  const concertRoutes = await getTravelEstimates(4.6485, -74.0776)

  // Eventos fijos
  const fixedEvents = [
    { id: 'rem-1', date: '2026-07-15', time: '13:40', title: 'Salida al Aeropuerto', description: '3 horas de anticipación en UIO', type: 'reminder' },
    { id: 'fli-1', date: '2026-07-15', time: '16:40', title: 'Vuelo UIO - GYE', description: 'Avianca AV1664', type: 'flight' },
    { id: 'fli-2', date: '2026-07-15', time: '18:50', title: 'Vuelo GYE - BOG', description: 'Llegada a las 20:45 (Terminal 1)', type: 'flight' },
    { id: 'acc-1', date: '2026-07-15', time: '22:00', title: 'Check-in Airbnb', description: '2717 Diagonal 61D', type: 'accommodation' },
    { id: 'rem-2', date: '2026-07-16', time: '10:00', title: 'Retirar Boletos', description: 'Recoger tickets físicos del concierto', type: 'reminder' },
    { id: 'con-1', date: '2026-07-16', time: '21:00', title: 'Concierto Rosalía', description: 'Movistar Arena Bogotá', type: 'concert', routes: concertRoutes },
    { id: 'rem-3', date: '2026-07-19', time: '08:25', title: 'Salida al Aeropuerto', description: '3 horas de anticipación en BOG', type: 'reminder' },
    { id: 'fli-3', date: '2026-07-19', time: '11:25', title: 'Vuelo BOG - UIO', description: 'Avianca AV117', type: 'flight' },
  ]

  // Unir y agrupar todo
  const allEvents = [...fixedEvents, ...activitiesWithRoutes]
  const groupedEvents = allEvents.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = []
    acc[event.date].push(event as any)
    return acc
  }, {} as Record<string, any[]>)

  const sortedDates = Object.keys(groupedEvents).sort()

  const getEventStyles = (type: string) => {
    switch (type) {
      case 'flight': return { icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-800/50' }
      case 'accommodation': return { icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-800/50' }
      case 'concert': return { icon: Music, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-800/50' }
      case 'reminder': return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-800/50' }
      default: return { icon: CheckCircle2, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-800/50' }
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-6">
        <div className="p-3 bg-blue-600/20 rounded-xl">
          <Navigation className="h-8 w-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Plan de Ruta y Tiempos</h1>
          <p className="text-slate-400 mt-1">Distancias calculadas automáticamente desde tu Airbnb.</p>
        </div>
      </div>

      <div className="space-y-12">
        {sortedDates.map((dateStr) => {
          const dayEvents = groupedEvents[dateStr].sort((a, b) => a.time.localeCompare(b.time))
          const formattedDate = format(parseISO(dateStr), "EEEE, d 'de' MMMM", { locale: es })

          return (
            <div key={dateStr} className="relative">
              <div className="absolute left-[31px] top-12 bottom-0 w-[2px] bg-slate-800 z-0"></div>
              
              <div className="sticky top-16 z-20 bg-slate-950/90 backdrop-blur-md py-3 mb-6 shadow-[0_10px_30px_-10px_rgba(2,6,23,1)]">
                <h2 className="text-xl font-bold text-slate-100 capitalize ml-20 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-500" /> {formattedDate}
                </h2>
              </div>

              <div className="space-y-6">
                {dayEvents.map((event) => {
                  const { icon: Icon, color, bg, border } = getEventStyles(event.type)
                  
                  return (
                    <div key={event.id} className="relative flex items-start gap-6 group z-10 pl-4">
                      <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-950 ring-8 ring-slate-950 transition-transform duration-300 group-hover:scale-110`}>
                        <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                      </div>

                      <div className={`flex-1 rounded-2xl border ${border} bg-slate-900/50 p-5 transition-all hover:bg-slate-900 shadow-md`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                          <h3 className="font-bold text-white text-lg">{event.title}</h3>
                          <span className="inline-flex items-center rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-bold text-slate-200 ring-1 ring-inset ring-slate-700/50 w-fit">
                            {event.time}
                          </span>
                        </div>
                        <p className="text-slate-400 mb-4">{event.description}</p>
                        
                        {/* Módulo de rutas (Si existe información de distancias) */}
                        {event.routes && (
                          <div className="flex gap-4 pt-4 border-t border-slate-800/50 mt-4">
                            <div className="flex items-center gap-2 text-sm bg-slate-950 px-3 py-2 rounded-lg text-slate-300 border border-slate-800">
                              <Footprints className="h-4 w-4 text-emerald-500" />
                              <span>{event.routes.walk} min caminando</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm bg-slate-950 px-3 py-2 rounded-lg text-slate-300 border border-slate-800">
                              <Car className="h-4 w-4 text-blue-500" />
                              <span>{event.routes.car} min en auto (Uber)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
