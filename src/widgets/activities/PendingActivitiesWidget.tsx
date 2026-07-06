import { createClient } from '@/shared/api/supabase/server'
import { ActivityVoteCard } from '@/features/activities/ui/ActivityVoteCard'
import { ListTodo } from 'lucide-react'
import { getTravelEstimates } from '@/features/routing/osrm'

export async function PendingActivitiesWidget() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Obtener actividades pendientes
  const { data: pendingActivities } = await supabase
    .from('activities')
    .select(`*, activity_approvals (user_id, status)`)
    .eq('status', 'PENDIENTE')
    .order('created_at', { ascending: false })

  if (!pendingActivities || pendingActivities.length === 0) return null

  // Obtener TODAS las actividades aprobadas para el listado de ubicaciones
  const { data: approvedActivities } = await supabase.from('activities').select('id, title, latitude, longitude').eq('status', 'APROBADA')

  // Construir las ubicaciones disponibles para calcular rutas
  const availableOrigins = [
    { id: 'airbnb', name: 'Airbnb (Campamento Base)', lat: 4.6460, lng: -74.0780 },
    { id: 'concierto', name: 'Concierto Rosalía (Movistar Arena)', lat: 4.6485, lng: -74.0776 },
    ...(approvedActivities || []).filter(a => a.latitude).map(a => ({ id: a.id, name: a.title, lat: a.latitude, lng: a.longitude }))
  ]

  const activitiesWithRouting = await Promise.all(
    pendingActivities.map(async (activity: any) => {
      let routing = null
      if (activity.latitude && activity.longitude) {
        routing = await getTravelEstimates(activity.latitude, activity.longitude) // Por defecto calcula desde el Airbnb
      }
      return { ...activity, routing }
    })
  )

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2 mb-4">
        <ListTodo className="h-5 w-5 text-yellow-500" /> Propuestas por Aprobar
        <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full font-bold">
          {activitiesWithRouting.length}
        </span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activitiesWithRouting.map((activity: any) => (
          <ActivityVoteCard 
            key={activity.id} 
            activity={activity} 
            currentUserId={user.id} 
            routing={activity.routing}
            locations={availableOrigins} // NUEVO: Pasamos las ubicaciones
          />
        ))}
      </div>
    </div>
  )
}