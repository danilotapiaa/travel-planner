'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { addBudgetItem } from '../actions'

export function BudgetItemForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    await addBudgetItem(formData)

    setIsSubmitting(false)
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5 text-emerald-500" /> Agregar Gasto
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-300">Título</label>
          <input name="title" required type="text" placeholder="Ej. Taxi al aeropuerto" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300">Categoría</label>
            <select name="category" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Transporte">Transporte</option>
              <option value="Alojamiento">Alojamiento</option>
              <option value="Comida">Comida</option>
              <option value="Compras">Compras</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300">Monto</label>
            <div className="flex gap-2 mt-1">
              <input name="amount" type="text" inputMode="decimal" required placeholder="0" className="flex-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <select name="currency" className="w-20 sm:w-24 rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="USD">USD</option>
                <option value="COP">COP</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300">Día (opcional)</label>
          <select name="item_date" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">General / Sin día específico</option>
            <option value="2026-07-15">Miércoles 15 de Julio</option>
            <option value="2026-07-16">Jueves 16 de Julio</option>
            <option value="2026-07-17">Viernes 17 de Julio</option>
            <option value="2026-07-18">Sábado 18 de Julio</option>
            <option value="2026-07-19">Domingo 19 de Julio</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300">Notas (Opcional)</label>
          <textarea name="notes" rows={2} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Detalles adicionales..."></textarea>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Agregar Gasto'}
        </button>
      </form>
    </div>
  )
}
