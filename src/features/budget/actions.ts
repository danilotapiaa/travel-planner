'use server'

import { createClient } from '@/shared/api/supabase/server'
import { revalidatePath } from 'next/cache'

// Función auxiliar para obtener la tasa de cambio en tiempo real
async function getCopToUsdRate() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=COP', {
      next: { revalidate: 3600 }
    })
    const data = await res.json()
    return data.rates?.COP || 3356
  } catch (error) {
    return 3356 // Fallback de seguridad
  }
}

// Función auxiliar para parsear, convertir y redondear perfectamente el monto
function parseAndConvertAmount(amountStr: string, currency: string, copRate: number) {
  let amount = parseFloat(amountStr.replace(',', '.')) || 0

  if (currency === 'COP' && amount > 0) {
    amount = amount / copRate
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export async function addBudgetItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const amountStr = formData.get('amount') as string || '0'
  const currency = formData.get('currency') as string || 'USD'
  const copRate = await getCopToUsdRate()

  const finalAmount = parseAndConvertAmount(amountStr, currency, copRate)
  const itemDate = formData.get('item_date') as string

  const { error } = await supabase.from('budget_items').insert({
    title: formData.get('title') as string,
    amount: finalAmount,
    category: formData.get('category') as string || null,
    item_date: itemDate || null,
    notes: formData.get('notes') as string || null,
    created_by: user.id
  })

  if (error) return { error: 'Error guardando gasto' }
  revalidatePath('/presupuesto')
  return { success: true }
}

export async function editBudgetItem(itemId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const amountStr = formData.get('amount') as string || '0'
  const currency = formData.get('currency') as string || 'USD'
  const copRate = await getCopToUsdRate()

  const finalAmount = parseAndConvertAmount(amountStr, currency, copRate)
  const itemDate = formData.get('item_date') as string

  await supabase.from('budget_items').update({
    title: formData.get('title') as string,
    amount: finalAmount,
    category: formData.get('category') as string || null,
    item_date: itemDate || null,
    notes: formData.get('notes') as string || null
  }).eq('id', itemId)

  revalidatePath('/presupuesto')
}

export async function deleteBudgetItem(itemId: string) {
  const supabase = await createClient()
  await supabase.from('budget_items').delete().eq('id', itemId)
  revalidatePath('/presupuesto')
}
