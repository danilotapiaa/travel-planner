'use server'

import { createClient } from '@/shared/api/supabase/server'
import { revalidatePath } from 'next/cache'

export async function proposeActivity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { error } = await supabase.from('activities').insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    price: parseFloat(formData.get('price') as string) || 0,
    start_time: formData.get('start_time') as string,
    duration_minutes: parseInt(formData.get('duration_minutes') as string) || null,
    latitude: parseFloat(formData.get('latitude') as string),
    longitude: parseFloat(formData.get('longitude') as string),
    place_id: formData.get('place_name') as string,
    website_url: formData.get('website_url') as string || null, // NUEVO
    created_by: user.id,
    status: 'PENDIENTE'
  })

  if (error) return { error: 'Error guardando actividad' }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteActivity(activityId: string) {
  const supabase = await createClient()
  await supabase.from('activities').delete().eq('id', activityId)
  revalidatePath('/', 'layout')
}

export async function editActivity(activityId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  await supabase.from('activities').update({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string) || 0,
    start_time: formData.get('start_time') as string,
    duration_minutes: parseInt(formData.get('duration_minutes') as string) || null,
    website_url: formData.get('website_url') as string || null, // NUEVO
    status: 'PENDIENTE',
    created_by: user.id 
  }).eq('id', activityId)

  await supabase.from('activity_approvals').delete().eq('activity_id', activityId)
  
  revalidatePath('/', 'layout')
}

export async function voteActivity(activityId: string, status: 'APPROVED' | 'REJECTED') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  await supabase.from('activity_approvals').upsert({
    activity_id: activityId,
    user_id: user.id,
    status: status
  })

  if (status === 'REJECTED') {
    await supabase.from('activities').update({ status: 'RECHAZADA' }).eq('id', activityId)
  } else {
    const { data: approvals } = await supabase
      .from('activity_approvals')
      .select('*')
      .eq('activity_id', activityId)
      .eq('status', 'APPROVED')

    if (approvals && approvals.length >= 2) {
      await supabase.from('activities').update({ status: 'APROBADA' }).eq('id', activityId)
    }
  }
  revalidatePath('/', 'layout')
  return { success: true }
}