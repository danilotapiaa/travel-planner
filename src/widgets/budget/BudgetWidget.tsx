import { createClient } from '@/shared/api/supabase/server'
import { ArrowUpRight } from 'lucide-react'

// Función para obtener tasas actualizadas con validación de seguridad
async function getExchangeRates() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=COP', {
      next: { revalidate: 3600 }
    })
    const data = await res.json()

    // Verificamos que 'rates' exista y tenga los valores antes de retornar
    return {
      COP: data.rates?.COP ?? 3356
    }
  } catch (error) {
    console.error("Error obteniendo tasas:", error)
    return { COP: 3356 }
  }
}

export async function BudgetWidget() {
  const supabase = await createClient()
  
  const { data: activities } = await supabase
    .from('activities')
    .select('price')
    .eq('status', 'APROBADA')

  const totalUSD = activities?.reduce((sum, act) => sum + (Number(act.price) || 0), 0) || 0
  
  const rates = await getExchangeRates()

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <span className="bg-emerald-500/10 p-1.5 rounded-lg">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </span>
            Presupuesto Actual
          </h2>
          <p className="text-xs text-slate-500 mt-1">Gasto de actividades aprobadas (sin vuelos ni entradas)</p>
        </div>
        <ArrowUpRight className="h-5 w-5 text-emerald-500" />
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total en Dólares</p>
        <p className="text-3xl font-bold text-white mt-1">US$ {totalUSD.toFixed(2)}</p>
      </div>

      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
        <p className="text-[10px] text-slate-500 uppercase font-semibold">Pesos Colombianos</p>
        <p className="text-lg font-bold text-white mt-1">
          $ {(totalUSD * rates.COP).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
        </p>
        {/* Aquí el fix: usamos (rates.COP || 0) para evitar el undefined */}
        <p className="text-[10px] text-slate-600 mt-1">Tasa: {(rates.COP || 0).toLocaleString('es-CO')}/USD</p>
      </div>
    </div>
  )
}