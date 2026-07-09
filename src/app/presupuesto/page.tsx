import { createClient } from '@/shared/api/supabase/server'
import { Wallet, Receipt } from 'lucide-react'
import { BudgetItemForm } from '@/features/budget/ui/BudgetItemForm'
import { BudgetItemCard } from '@/features/budget/ui/BudgetItemCard'

const DATE_LABELS: Record<string, string> = {
  '2026-07-15': 'Miércoles 15 de Julio',
  '2026-07-16': 'Jueves 16 de Julio',
  '2026-07-17': 'Viernes 17 de Julio',
  '2026-07-18': 'Sábado 18 de Julio',
  '2026-07-19': 'Domingo 19 de Julio'
}

async function getExchangeRates() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=COP', {
      next: { revalidate: 3600 }
    })
    const data = await res.json()
    return {
      COP: data.rates?.COP ?? 3356
    }
  } catch (error) {
    return { COP: 3356 }
  }
}

export default async function PresupuestoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: items }, { data: approvedActivities }] = await Promise.all([
    supabase
      .from('budget_items')
      .select('*')
      .order('item_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true }),
    supabase
      .from('activities')
      .select('price')
      .eq('status', 'APROBADA')
  ])

  const budgetItems = items || []
  const manualUSD = budgetItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const activitiesUSD = (approvedActivities || []).reduce((sum, act) => sum + (Number(act.price) || 0), 0)
  const totalUSD = manualUSD + activitiesUSD
  const rates = await getExchangeRates()

  const grouped = budgetItems.reduce((acc, item) => {
    const key = item.item_date || 'general'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, typeof budgetItems>)

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === 'general') return 1
    if (b === 'general') return -1
    return a.localeCompare(b)
  })

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-6">
        <div className="p-3 bg-emerald-600/20 rounded-xl">
          <Wallet className="h-8 w-8 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Presupuesto</h1>
          <p className="text-slate-400 mt-1">Presupuesto total del viaje: actividades aprobadas + gastos sueltos.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <span className="bg-emerald-500/10 p-1.5 rounded-lg">
                <Receipt className="w-4 h-4 text-emerald-500" />
              </span>
              Presupuesto Total del Viaje
            </h2>
            <p className="text-xs text-slate-500 mt-1">Suma de las actividades aprobadas del itinerario + los gastos registrados aquí</p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total en Dólares</p>
          <p className="text-3xl font-bold text-white mt-1">US$ {totalUSD.toFixed(2)}</p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Pesos Colombianos</p>
          <p className="text-lg font-bold text-white mt-1">
            $ {(totalUSD * rates.COP).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-slate-600 mt-1">Tasa: {(rates.COP || 0).toLocaleString('es-CO')}/USD</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800/70">
            <span className="text-xs text-slate-400">Actividades aprobadas</span>
            <span className="text-sm font-semibold text-slate-200">US$ {activitiesUSD.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800/70">
            <span className="text-xs text-slate-400">Gastos manuales</span>
            <span className="text-sm font-semibold text-slate-200">US$ {manualUSD.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <BudgetItemForm />
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Gastos Manuales Registrados</h2>
      <div className="space-y-8">
        {sortedKeys.length === 0 && (
          <p className="text-slate-500 text-center py-8">Aún no has agregado ningún gasto manual. Las actividades aprobadas del itinerario ya están incluidas en el total de arriba.</p>
        )}

        {sortedKeys.map((key) => (
          <div key={key}>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {key === 'general' ? 'General / Sin día específico' : (DATE_LABELS[key] || key)}
            </h3>
            <div className="space-y-3">
              {grouped[key].map((item: any) => (
                <BudgetItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
