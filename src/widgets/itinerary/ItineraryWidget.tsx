import { createClient } from '@/shared/api/supabase/server'
import { CalendarDays, Plane, MapPin, Music, Clock, CheckCircle2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// Estructura base para cualquier evento del viaje
type TripEvent = {
  id: string
  date: string // Formato YYYY-MM-DD para agrupar
  time: string // Formato HH:mm para ordenar
  title: string
  description: string
  type: 'flight' | 'accommodation' | 'activity' | 'concert' | 'reminder'
}

type ApprovedActivity = {
  id: string
  title: string
  category: string | null
  place_id: string | null
  start_time: string | null
}

export async function ItineraryWidget() {
  const supabase = await createClient()

  // 1. Traer actividades aprobadas de la base de datos
  const { data: approvedActivities } = await supabase
    .from('activities')
    .select('*')
    .eq('status', 'APROBADA')

  const typedActivities = (approvedActivities || []) as ApprovedActivity[]

  // 2. Eventos Fijos del Viaje (Vuelos, Alojamiento, Concierto)
  const fixedEvents: TripEvent[] = [
    { id: 'rem-1', date: '2026-07-15', time: '13:40', title: 'Salida al Aeropuerto', description: '3 horas de anticipación en UIO', type: 'reminder' },
    { id: 'fli-1', date: '2026-07-15', time: '16:40', title: 'Vuelo UIO - GYE', description: 'Avianca AV1664', type: 'flight' },
    { id: 'fli-2', date: '2026-07-15', time: '18:50', title: 'Vuelo GYE - BOG', description: 'Llegada a las 20:45 (Terminal 1)', type: 'flight' },
    { id: 'acc-1', date: '2026-07-15', time: '22:00', title: 'Check-in Airbnb', description: '2717 Diagonal 61D', type: 'accommodation' },
    { id: 'rem-2', date: '2026-07-16', time: '10:00', title: 'Retirar Boletos', description: 'Recoger tickets físicos del concierto', type: 'reminder' },
    { id: 'con-1', date: '2026-07-16', time: '21:00', title: 'Concierto Rosalía', description: 'Movistar Arena Bogotá', type: 'concert' },
    { id: 'rem-3', date: '2026-07-19', time: '08:25', title: 'Salida al Aeropuerto', description: '3 horas de anticipación en BOG', type: 'reminder' },
    { id: 'fli-3', date: '2026-07-19', time: '11:25', title: 'Vuelo BOG - UIO', description: 'Avianca AV117', type: 'flight' },
  ]

  // 3. Formatear las actividades de la BD para que coincidan con la estructura
  const dbEvents: TripEvent[] = typedActivities.map((activity) => {
    // Si no tienen hora definida, las asignamos por defecto a las 12:00 PM del día 17
    const activityDate = activity.start_time ? new Date(activity.start_time) : new Date('2026-07-17T12:00:00')
    return {
      id: activity.id,
      date: format(activityDate, 'yyyy-MM-dd'),
      time: format(activityDate, 'HH:mm'),
      title: activity.title,
      description: activity.place_id ? activity.place_id.split(',')[0] : (activity.category || 'Actividad aprobada'),
      type: 'activity'
    }
  })

  // 4. Unir todos los eventos y agruparlos por día
  const allEvents = [...fixedEvents, ...dbEvents]
  
  // Agrupar por fecha
  const groupedEvents = allEvents.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = []
    acc[event.date].push(event)
    return acc
  }, {} as Record<string, TripEvent[]>)

  // Ordenar los días cronológicamente y los eventos por hora
  const sortedDates = Object.keys(groupedEvents).sort()

  // Configuración visual según el tipo de evento
  const getEventStyles = (type: TripEvent['type']) => {
    switch (type) {
      case 'flight': return { icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-800/50' }
      case 'accommodation': return { icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-800/50' }
      case 'concert': return { icon: Music, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-800/50' }
      case 'reminder': return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-800/50' }
      case 'activity': return { icon: CheckCircle2, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-800/50' }
    }
  }

  return (
    <div className="mt-12 mb-8">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <CalendarDays className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Itinerario Oficial</h2>
          <p className="text-sm text-slate-400">Cronograma del viaje sincronizado en tiempo real.</p>
        </div>
      </div>

      <div className="space-y-8">
        {sortedDates.map((dateStr) => {
          // Ordenar eventos del día por hora
          const dayEvents = groupedEvents[dateStr].sort((a, b) => a.time.localeCompare(b.time))
          
          // Formatear la fecha (ej. "Miércoles, 15 de julio")
          const dateObj = parseISO(dateStr)
          const formattedDate = format(dateObj, "EEEE, d 'de' MMMM", { locale: es })

          return (
            <div key={dateStr} className="relative">
              {/* Línea vertical conectora */}
              <div className="absolute left-[27px] top-10 bottom-0 w-[2px] bg-slate-800 z-0"></div>
              
              {/* Cabecera del Día */}
              <div className="sticky top-16 z-10 bg-slate-950/90 backdrop-blur-sm py-2 mb-4">
                <h3 className="text-lg font-semibold text-slate-200 capitalize ml-16">
                  {formattedDate}
                </h3>
              </div>

              {/* Eventos del Día */}
              <div className="space-y-4">
                {dayEvents.map((event) => {
                  const { icon: Icon, color, bg, border } = getEventStyles(event.type)
                  
                  return (
                    <div key={event.id} className="relative flex items-start gap-4 group z-10">
                      {/* Círculo del Timeline */}
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-950 ring-4 ring-slate-950 transition-colors group-hover:border-slate-600">
                        <div className={`h-8 w-8 rounded-full ${bg} flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                      </div>

                      {/* Tarjeta del Evento */}
                      <div className={`flex-1 rounded-xl border ${border} bg-slate-900/50 p-4 transition-all hover:bg-slate-900 shadow-sm`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-white text-base">{event.title}</h4>
                          <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-700/50 w-fit shrink-0">
                            {event.time}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{event.description}</p>
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