'use client'

import { useState } from 'react'
import { DollarSign, Trash2, Edit3, X, Loader2, Tag, FileText } from 'lucide-react'
import { editBudgetItem, deleteBudgetItem } from '../actions'

type BudgetItemProps = {
  item: {
    id: string
    title: string
    amount: number
    category: string | null
    item_date: string | null
    notes: string | null
  }
}

const DATE_LABELS: Record<string, string> = {
  '2026-07-15': 'Miércoles 15 de Julio',
  '2026-07-16': 'Jueves 16 de Julio',
  '2026-07-17': 'Viernes 17 de Julio',
  '2026-07-18': 'Sábado 18 de Julio',
  '2026-07-19': 'Domingo 19 de Julio'
}

export function BudgetItemCard({ item }: BudgetItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este gasto?')) return
    setIsDeleting(true)
    await deleteBudgetItem(item.id)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    await editBudgetItem(item.id, formData)
    setIsSaving(false)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="bg-slate-900 border border-emerald-800 rounded-xl p-4 shadow-lg shadow-emerald-900/10 relative">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-white flex items-center gap-2"><Edit3 className="h-4 w-4 text-emerald-400" /> Editar Gasto</h4>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleEditSubmit} className="space-y-3 text-sm">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Título</label>
            <input name="title" defaultValue={item.title} required className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Categoría</label>
              <select name="category" defaultValue={item.category || 'Otro'} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="Transporte">Transporte</option>
                <option value="Alojamiento">Alojamiento</option>
                <option value="Comida">Comida</option>
                <option value="Compras">Compras</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Monto (USD)</label>
              <div className="flex gap-2">
                <input name="amount" type="text" inputMode="decimal" defaultValue={item.amount} className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                <select name="currency" defaultValue="USD" className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500">
                  <option value="USD">USD</option>
                  <option value="COP">COP</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Día</label>
            <select name="item_date" defaultValue={item.item_date || ''} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="">General / Sin día específico</option>
              <option value="2026-07-15">Miércoles 15 de Julio</option>
              <option value="2026-07-16">Jueves 16 de Julio</option>
              <option value="2026-07-17">Viernes 17 de Julio</option>
              <option value="2026-07-18">Sábado 18 de Julio</option>
              <option value="2026-07-19">Domingo 19 de Julio</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Notas</label>
            <textarea name="notes" defaultValue={item.notes || ''} rows={2} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"></textarea>
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-slate-600 transition-colors w-full">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 pl-2 pb-2 rounded-bl-lg z-10">
        <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded-md transition-colors" title="Editar Gasto">
          <Edit3 className="h-4 w-4" />
        </button>
        <button onClick={handleDelete} disabled={isDeleting} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-md transition-colors" title="Eliminar Gasto">
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      <h4 className="font-semibold text-white text-lg pr-16">{item.title}</h4>

      {item.notes && (
        <p className="text-sm text-slate-400 mt-1 mb-3 flex items-start gap-1.5">
          <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-500" /> {item.notes}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-3 text-xs">
        {item.category && (
          <span className="flex items-center gap-1.5 text-slate-300 bg-slate-950/50 px-2.5 py-1.5 rounded-md border border-slate-800">
            <Tag className="h-3.5 w-3.5 text-slate-500" /> {item.category}
          </span>
        )}
        {item.item_date && (
          <span className="flex items-center gap-1.5 text-slate-300 bg-slate-950/50 px-2.5 py-1.5 rounded-md border border-slate-800">
            {DATE_LABELS[item.item_date] || item.item_date}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/40 px-2.5 py-1.5 rounded-md border border-emerald-900/50 font-medium">
          <DollarSign className="h-3.5 w-3.5" /> {Number(item.amount).toFixed(2)} USD
        </span>
      </div>
    </div>
  )
}
