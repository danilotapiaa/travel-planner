'use server'

import { createClient } from '@/shared/api/supabase/server'
import { revalidatePath } from 'next/cache'

export async function proposeActivity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Usuario no autenticado')

  // Extraer datos del formulario
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const lat = parseFloat(formData.get('latitude') as string)
  const lng = parseFloat(formData.get('longitude') as string)
  const placeName = formData.get('place_name') as string

  // Insertar en la base de datos
  const { data: activity, error } = await supabase.from('activities').insert({
    title,
    description,
    category,
    price,
    latitude: lat,
    longitude: lng,
    place_id: placeName, // Guardamos el nombre del lugar como referencia
    created_by: user.id,
    status: 'PENDIENTE'
  }).select('id').single()

  if (error) {
    console.error('Error guardando actividad:', error)
    return { error: 'No se pudo guardar la actividad' }
  }

  const { error: approvalError } = await supabase.from('activity_approvals').upsert({
    activity_id: activity.id,
    user_id: user.id,
    status: 'APPROVED'
  })

  if (approvalError) {
    console.error('Error registrando aprobación inicial:', approvalError)
    return { error: 'No se pudo registrar la actividad' }
  }

  // Recargar el dashboard para mostrar la nueva propuesta
  revalidatePath('/')
  return { success: true }
}

export async function voteActivity(activityId: string, status: 'APPROVED' | 'REJECTED') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Usuario no autenticado')

  // 1. Registrar o actualizar el voto del usuario
  const { error: voteError } = await supabase.from('activity_approvals').upsert({
    activity_id: activityId,
    user_id: user.id,
    status: status
  })

  if (voteError) {
    console.error('Error registrando el voto:', voteError)
    return { error: 'No se pudo procesar el voto' }
  }

  // 2. Si el usuario rechaza, la actividad queda descartada inmediatamente
  if (status === 'REJECTED') {
    await supabase.from('activities').update({ status: 'RECHAZADA' }).eq('id', activityId)
  }
  // 3. Si aprueba, verificamos cuántas aprobaciones tiene en total
  else if (status === 'APPROVED') {
    const { data: approvals } = await supabase
      .from('activity_approvals')
      .select('*')
      .eq('activity_id', activityId)
      .eq('status', 'APPROVED')

    // Como es un viaje de 2 personas, 2 votos = Aprobada
    if (approvals && approvals.length >= 2) {
      await supabase.from('activities').update({ status: 'APROBADA' }).eq('id', activityId)
    }
  }

  // Refrescar la interfaz para reflejar los cambios
  revalidatePath('/')
  return { success: true }
}