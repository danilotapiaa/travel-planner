import { createClient } from '@/shared/api/supabase/server'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, Music, Plane, Clock, CheckCircle2, Navigation } from 'lucide-react'
import { getTravelEstimates } from '@/features/routing/osrm'
import { ActivityVoteCard } from '@/features/activities/ui/ActivityVoteCard'

export default async function ItineraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: routeActivities } = await supabase
    .from('activities')
    .select(`*, activity_approvals(user_id, status)`)
    .in('status', ['APROBADA', 'PENDIENTE'])

  const availableOrigins = [
    { id: 'airbnb', name: 'Airbnb (Campamento Base)', lat: 4.6460, lng: -74.0780 },
    { id: 'concierto', name: 'Concierto Rosalía (Movistar Arena)', lat: 4.6485, lng: -74.0776 },
    ...(routeActivities || []).filter(a => a.latitude).map(a => ({ id: a.id, name: a.title, lat: a.latitude, lng: a.longitude }))
  ]

  const activitiesWithRoutes = await Promise.all(
    (routeActivities || []).map(async (act) => {
      let routes = null
      if (act.latitude && act.longitude) {
        if (act.route_origin_lat && act.route_origin_lng) {
          routes = await getTravelEstimates(act.latitude, act.longitude, parseFloat(act.route_origin_lat), parseFloat(act.route_origin_lng))
        } else {
          routes = await getTravelEstimates(act.latitude, act.longitude)
        }
      }
      const actDate = act.start_time ? new Date(act.start_time) : new Date('2026-07-17T12:00:00')
      return {
        ...act,
        isFixed: false,
        date: format(actDate, 'yyyy-MM-dd'),
        time: format(actDate, 'HH:mm'),
        routes
      }
    })
  )

  const fixedEvents = [
    { id: 'rem-1', isFixed: true, type: 'reminder', date: '2026-07-15', time: '13:40', endTime: '16:40', title: 'Salida al Aeropuerto UIO', description: '3 horas de anticipación' },
    { id: 'fli-1', isFixed: true, type: 'flight', date: '2026-07-15', time: '16:40', endTime: '17:35', title: 'Vuelo UIO - GYE', description: 'Avianca AV1664' },
    { id: 'fli-2', isFixed: true, type: 'flight', date: '2026-07-15', time: '18:50', endTime: '20:45', title: 'Vuelo GYE - BOG', description: 'Llegada a Terminal 1' },
    { id: 'acc-1', isFixed: true, type: 'accommodation', date: '2026-07-15', time: '22:00', endTime: '23:00', title: 'Check-in Airbnb', description: '2717 Diagonal 61D' },
    { id: 'rem-2', isFixed: true, type: 'reminder', date: '2026-07-16', time: '10:00', endTime: '11:00', title: 'Retirar Boletos', description: 'Recoger tickets físicos del concierto' },
    { id: 'con-1', isFixed: true, type: 'concert', date: '2026-07-16', time: '21:00', endTime: '23:30', title: 'Concierto Rosalía', description: 'Movistar Arena Bogotá' },
    { id: 'rem-3', isFixed: true, type: 'reminder', date: '2026-07-19', time: '08:25', endTime: '11:25', title: 'Salida al Aeropuerto BOG', description: '3 horas de anticipación' },
    { id: 'fli-3', isFixed: true, type: 'flight', date: '2026-07-19', time: '11:25', endTime: '13:05', title: 'Vuelo BOG - UIO', description: 'Avianca AV117' },
  ]

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
          <p className="text-slate-400 mt-1">Tu itinerario interactivo completo.</p>
        </div>
      </div>

      <div className="space-y-12">
        {sortedDates.map((dateStr) => {
          const dayEvents = groupedEvents[dateStr].sort((a: any, b: any) => a.time.localeCompare(b.time))
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
                {dayEvents.map((event: any) => {
                  const { icon: Icon, color, bg, border } = getEventStyles(event.status === 'PENDIENTE' ? 'reminder' : event.type || 'activity')
                  
                  return (
                    <div key={event.id} className="relative flex items-start gap-6 group z-10 pl-4">
                      <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-950 ring-8 ring-slate-950 transition-transform duration-300 group-hover:scale-110`}>
                        <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                      </div>

                      <div className="flex-1 w-full max-w-full">
                        {event.isFixed ? (
                          <div className={`rounded-2xl border ${border} bg-slate-900/50 p-5 transition-all shadow-md`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                              <h3 className="font-bold text-white text-lg">{event.title}</h3>
                              <span className="inline-flex items-center rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-bold text-slate-200 ring-1 ring-inset ring-slate-700/50 w-fit">
                                {event.time} {event.endTime ? ` - ${event.endTime}` : ''}
                              </span>
                            </div>
                            <p className="text-slate-400">{event.description}</p>
                          </div>
                        ) : (
                          <ActivityVoteCard 
                            activity={event} 
                            currentUserId={user.id} 
                            routing={event.routes} 
                            locations={availableOrigins} 
                          />
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