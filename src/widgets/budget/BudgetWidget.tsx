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
  
  // 3. Añadir costos fijos (Vuelos de ida y vuelta precargados)
  const flightCost = 156.00 // Costo del ticket UIO-BOG
  const totalUSD = activitiesCost + flightCost

  // 4. Calcular conversiones
  const rates = await getExchangeRates()
  const totalCOP = totalUSD * rates.cop
  const totalMXN = totalUSD * rates.mxn

  // Formateadores de moneda
  const formatCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" /> Presupuesto Actual
          </h2>
          <p className="text-sm text-slate-400 mt-1">Gasto total acumulado (Vuelos + Aprobados)</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
        </div>
      </div>

      {/* Tarjeta Principal USD */}
      <div className="bg-slate-950/50 rounded-xl p-4 border border-emerald-900/30 mb-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-800">
          <DollarSign className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium mb-1">Total en Dólares</p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {formatCurrency(totalUSD, 'USD')}
          </p>
        </div>
      </div>

      {/* Conversiones Locales */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Coins className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">Pesos Colombianos</span>
          </div>
          <p className="text-lg font-semibold text-slate-200">
            {formatCurrency(totalCOP, 'COP')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Tasa: {formatCurrency(rates.cop, 'COP')}</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Coins className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-medium">Pesos Mexicanos</span>
          </div>
          <p className="text-lg font-semibold text-slate-200">
            {formatCurrency(totalMXN, 'MXN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Tasa: {formatCurrency(rates.mxn, 'MXN')}</p>
        </div>
      </div>
    </div>
  )
}