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
  const { error } = await supabase.from('activities').insert({
    title,
    description,
    category,
    price,
    latitude: lat,
    longitude: lng,
    place_id: placeName, // Guardamos el nombre del lugar como referencia
    created_by: user.id,
    status: 'PENDIENTE'
  })

  if (error) {
    console.error('Error guardando actividad:', error)
    return { error: 'No se pudo guardar la actividad' }
  }

  // Recargar el dashboard para mostrar la nueva propuesta
  revalidatePath('/')
  return { success: true }
}