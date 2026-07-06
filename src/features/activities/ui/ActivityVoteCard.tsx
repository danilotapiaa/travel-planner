'use client'

import { useState } from 'react'
import { MapPin, DollarSign, CheckCircle, XCircle, Clock, Trash2, Edit3, Car, Footprints, Loader2, X, Globe } from 'lucide-react'
import { voteActivity, deleteActivity, editActivity } from '../actions'
import { getTravelEstimates } from '@/features/routing/osrm'

type ActivityProps = {
  activity: any
  currentUserId: string
  routing?: { car: number, walk: number } | null 
  locations?: { id: string, name: string, lat: number, lng: number }[] // NUEVO: Lugares disponibles para calcular rutas
}

export function ActivityVoteCard({ activity, currentUserId, routing, locations = [] }: ActivityProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Estados para el cálculo de rutas dinámico
  const [origin, setOrigin] = useState("4.6460,-74.0780") // Airbnb por defecto
  const [dynamicRouting, setDynamicRouting] = useState(routing)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  
  const isCreator = activity.created_by === currentUserId
  const myVote = activity.activity_approvals?.find((a: any) => a.user_id === currentUserId)

  // Cálculo de horas
  let defaultDate = ""
  let defaultTime = ""
  let defaultEndTime = ""

  if (activity.start_time) {
    const dateObj = new Date(activity.start_time)
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
    })
    
    const parts = fmt.formatToParts(dateObj)
    const getPart = (type: string) => parts.find(p => p.type === type)?.value
    
    defaultDate = `${getPart('year')}-${getPart('month')}-${getPart('day')}`
    let hour = getPart('hour') || '00'
    if (hour === '24') hour = '00'
    defaultTime = `${hour}:${getPart('minute')}`

    if (activity.duration_minutes) {
      const [hh, mm] = defaultTime.split(':').map(Number)
      const totalMins = hh * 60 + mm + activity.duration_minutes
      const endH = Math.floor(totalMins / 60) % 24
      const endM = totalMins % 60
      defaultEndTime = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`
    }
  }

  const handleVote = async (status: 'APPROVED' | 'REJECTED') => {
    setIsVoting(true)
    await voteActivity(activity.id, status)
    setIsVoting(false)
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta propuesta? Se borrará para ambos.')) return
    setIsDeleting(true)
    await deleteActivity(activity.id)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    
    const formData = new FormData(e.currentTarget)
    const selectedDate = formData.get('trip_date') as string
    const selectedTime = formData.get('trip_time') as string
    const endTime = formData.get('end_time') as string

    const isoDateTime = `${selectedDate}T${selectedTime}:00-05:00`
    
    if (endTime) {
      const start = new Date(isoDateTime)
      const end = new Date(`${selectedDate}T${endTime}:00-05:00`)
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000)
      if (diffMinutes > 0) formData.append('duration_minutes', diffMinutes.toString())
    }
    
    formData.append('start_time', isoDateTime)
    await editActivity(activity.id, formData)
    setIsSaving(false)
    setIsEditing(false)
  }

  const handleOriginChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setOrigin(val)
    setIsLoadingRoute(true)
    const [origLat, origLng] = val.split(',')
    const res = await getTravelEstimates(activity.latitude, activity.longitude, parseFloat(origLat), parseFloat(origLng))
    setDynamicRouting(res)
    setIsLoadingRoute(false)
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`

  if (isEditing) {
    return (
      <div className="bg-slate-900 border border-blue-800 rounded-xl p-4 shadow-lg shadow-blue-900/10 relative">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-white flex items-center gap-2"><Edit3 className="h-4 w-4 text-blue-400" /> Editar Propuesta</h4>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleEditSubmit} className="space-y-3 text-sm">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Título</label>
            <input name="title" defaultValue={activity.title} required className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Día</label>
            <select name="trip_date" defaultValue={defaultDate} required className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="2026-07-15">Miércoles 15 de Julio</option>
              <option value="2026-07-16">Jueves 16 de Julio</option>
              <option value="2026-07-17">Viernes 17 de Julio</option>
              <option value="2026-07-18">Sábado 18 de Julio</option>
              <option value="2026-07-19">Domingo 19 de Julio</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Hora Inicio</label>
              <input name="trip_time" type="time" defaultValue={defaultTime} required className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Hora Fin</label>
              <input name="end_time" type="time" defaultValue={defaultEndTime} required className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Precio Estimado (USD)</label>
            <input name="price" type="text" inputMode="decimal" defaultValue={activity.price} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Enlace Web (Opcional)</label>
            <input name="website_url" type="url" defaultValue={activity.website_url || ''} placeholder="https://..." className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Descripción / Notas</label>
            <textarea name="description" defaultValue={activity.description} rows={2} className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar y Renegociar'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-slate-600 transition-colors">
      <div className={`absolute top-0 left-0 w-1 h-full ${activity.status === 'PENDIENTE' ? 'bg-yellow-500' : 'bg-purple-500'}`}></div>
      
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 pl-2 pb-2 rounded-bl-lg z-10">
        <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-blue-400 bg-slate-800 rounded-md transition-colors" title="Editar Propuesta">
          <Edit3 className="h-4 w-4" />
        </button>
        <button onClick={handleDelete} disabled={isDeleting} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-md transition-colors" title="Eliminar Propuesta">
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      <h4 className="font-semibold text-white text-lg pr-16">{activity.title} {activity.status === 'PENDIENTE' ? '(Pendiente)' : ''}</h4>
      
      {activity.start_time && (
        <p className={`text-xs font-medium mt-1 mb-2 flex items-center gap-1 ${activity.status === 'PENDIENTE' ? 'text-yellow-400' : 'text-purple-400'}`}>
          <Clock className="h-3 w-3" />
          {new Date(activity.start_time).toLocaleString('es-CO', { timeZone: 'America/Bogota', weekday: 'long' })} • {defaultTime} {activity.duration_minutes ? ` - ${defaultEndTime}` : ''}
        </p>
      )}

      <p className="text-sm text-slate-400 mb-4">{activity.description}</p>

      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 bg-blue-950/40 px-2.5 py-1.5 rounded-md border border-blue-900/50 transition-colors">
          <MapPin className="h-3.5 w-3.5" /> Abrir en Maps
        </a>
        {activity.website_url && (
          <a href={activity.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 px-2.5 py-1.5 rounded-md border border-emerald-900/50 transition-colors">
            <Globe className="h-3.5 w-3.5" /> Ver web
          </a>
        )}
      </div>

      {locations.length > 0 && activity.latitude && (
        <div className="mb-3 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
          <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5 block">Calcular ruta desde:</label>
          <select value={origin} onChange={handleOriginChange} className="w-full bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-300 px-2 py-1.5 focus:outline-none focus:border-blue-500 mb-2">
            {locations.filter((loc: any) => loc.id !== activity.id).map((loc: any) => (
              <option key={loc.id} value={`${loc.lat},${loc.lng}`}>{loc.name}</option>
            ))}
          </select>

          {isLoadingRoute ? (
            <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin"/> Calculando nueva ruta...</div>
          ) : dynamicRouting ? (
            <div className="flex gap-4 text-xs text-slate-300 mt-2">
              <span className="flex items-center gap-1" title="Tiempo estimado en Uber/Auto"><Car className="h-3.5 w-3.5 text-blue-400"/> {dynamicRouting.car} min</span>
              <span className="flex items-center gap-1" title="Tiempo estimado caminando"><Footprints className="h-3.5 w-3.5 text-emerald-400"/> {dynamicRouting.walk} min</span>
            </div>
          ) : null}
        </div>
      )}

      {activity.status === 'PENDIENTE' && (
        <div className="pt-3 border-t border-slate-800">
          {isCreator && !myVote ? (
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 bg-yellow-900/10 py-2 rounded-md">
              <Clock className="h-4 w-4" /><span>Esperando confirmación...</span>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => handleVote('REJECTED')} disabled={isVoting} className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-400 py-2 rounded-md transition-colors text-sm font-medium border border-slate-700 disabled:opacity-50">
                <XCircle className="h-4 w-4" /> Rechazar
              </button>
              <button onClick={() => handleVote('APPROVED')} disabled={isVoting} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md transition-colors text-sm font-medium disabled:opacity-50">
                <CheckCircle className="h-4 w-4" /> Aprobar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}