import { createClient } from '@/shared/api/supabase/server'
import { Wallet, TrendingUp, DollarSign, Coins } from 'lucide-react'

// Función para obtener tasas de cambio en tiempo real (Caché de 1 hora)
async function getExchangeRates() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 3600 }
    })
    const data = await res.json()
    return { cop: data.rates.COP, mxn: data.rates.MXN }
  } catch (error) {
    console.error('Error fetching rates', error)
    return { cop: 3900, mxn: 17 } // Tasas de respaldo en caso de fallo de red
  }
}

export async function BudgetWidget() {
  const supabase = await createClient()

  // 1. Obtener todas las actividades que ya fueron aprobadas por ambos
  const { data: approvedActivities } = await supabase
    .from('activities')
    .select('price')
    .eq('status', 'APROBADA')

  // 2. Sumar el costo de las actividades
  const activitiesCost = approvedActivities?.reduce((acc, act) => acc + (Number(act.price) || 0), 0) || 0
  
  // 3. Total sin costos fijos (vuelos y boletos ya pagados)
  const totalUSD = activitiesCost

  // 4. Calcular conversiones
  const rates = await getExchangeRates()
  const totalCOP = totalUSD * rates.cop
  const totalMXN = totalUSD * rates.mxn

  // Formateadores de moneda
  const formatCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" /> Presupuesto Actual
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Gasto de actividades aprobadas (sin vuelos ni entradas)</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
        </div>
      </div>

      {/* Tarjeta Principal USD */}
      <div className="bg-slate-950/50 rounded-xl p-4 border border-emerald-900/30 mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-800 shrink-0">
          <DollarSign className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-slate-400 font-medium mb-1">Total en Dólares</p>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight break-words">
            {formatCurrency(totalUSD, 'USD')}
          </p>
        </div>
      </div>

      {/* Conversiones Locales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Coins className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Pesos Colombianos</span>
          </div>
          <p className="text-base sm:text-lg font-semibold text-slate-200 break-words">
            {formatCurrency(totalCOP, 'COP')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Tasa: {formatCurrency(rates.cop, 'COP')}/USD</p>
        </div>

        <div className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Coins className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Pesos Mexicanos</span>
          </div>
          <p className="text-base sm:text-lg font-semibold text-slate-200 break-words">
            {formatCurrency(totalMXN, 'MXN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Tasa: {formatCurrency(rates.mxn, 'MXN')}/USD</p>
        </div>
      </div>
    </div>
  )
}