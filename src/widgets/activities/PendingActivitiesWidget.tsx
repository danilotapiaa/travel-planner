import { createClient } from '@/shared/api/supabase/server'
import { ActivityVoteCard } from '@/features/activities/ui/ActivityVoteCard'
import { ListTodo } from 'lucide-react'

export async function PendingActivitiesWidget() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Obtener actividades pendientes y sus aprobaciones asociadas
  const { data: pendingActivities } = await supabase
    .from('activities')
    .select(`
      *,
      activity_approvals (
        user_id,
        status
      )
    `)
    .eq('status', 'PENDIENTE')
    .order('created_at', { ascending: false })

  if (!pendingActivities || pendingActivities.length === 0) {
    return null // Si no hay nada pendiente, no mostramos el widget
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2 mb-4">
        <ListTodo className="h-5 w-5 text-yellow-500" /> Propuestas por Aprobar
        <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full font-bold">
          {pendingActivities.length}
        </span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingActivities.map((activity) => (
          <ActivityVoteCard 
            key={activity.id} 
            activity={activity} 
            currentUserId={user.id} 
          />
        ))}
      </div>
    </div>
  )
}