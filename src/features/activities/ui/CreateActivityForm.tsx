'use client'

import { useState, type FormEvent, type MouseEvent } from 'react'
import { Search, MapPin, Loader2, Check } from 'lucide-react'
import { proposeActivity } from '../actions'

// Tipo para los resultados de OpenStreetMap
type OSMResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export function CreateActivityForm() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<OSMResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<OSMResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Función para buscar en OpenStreetMap (Gratuita)
  const handleSearch = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!searchQuery) return

    setIsSearching(true)
    try {
      // Agregamos "Bogotá" a la búsqueda para mejorar la precisión
      const res = await fetch(
        `/api/nominatim/search?q=${encodeURIComponent(searchQuery + ' Bogotá')}`,
        {
          headers: {
            'Accept-Language': 'es',
          }
        }
      )
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error('Error buscando lugar:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPlace) return
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    // Inyectamos las coordenadas del lugar seleccionado
    formData.append('latitude', selectedPlace.lat)
    formData.append('longitude', selectedPlace.lon)
    formData.append('place_name', selectedPlace.display_name)

    await proposeActivity(formData)
    
    // Limpiar formulario tras el éxito
    setIsSubmitting(false)
    setSelectedPlace(null)
    setSearchQuery('')
    setResults([])
    ;(e.target as HTMLFormElement).reset()
    alert('¡Actividad propuesta correctamente! Esperando aprobación.')
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4">Proponer Nueva Actividad</h3>
      
      {/* Buscador de Lugares */}
      <div className="mb-6 space-y-2">
        <label className="text-sm font-medium text-slate-300">Buscar Ubicación</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ej. Museo del Oro, Monserrate..."
            className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition flex items-center justify-center disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </div>

        {/* Resultados de Búsqueda */}
        {results.length > 0 && !selectedPlace && (
          <div className="mt-2 border border-slate-700 rounded-md bg-slate-950 overflow-hidden">
            {results.map((place) => (
              <div
                key={place.place_id}
                onClick={() => setSelectedPlace(place)}
                className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 flex items-start gap-3 transition"
              >
                <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 line-clamp-2">{place.display_name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Lugar Seleccionado */}
        {selectedPlace && (
          <div className="mt-2 bg-blue-900/20 border border-blue-800 p-3 rounded-md flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-200 line-clamp-1">{selectedPlace.display_name}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setSelectedPlace(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cambiar
            </button>
          </div>
        )}
      </div>

      {/* Formulario Principal (Solo se muestra si hay un lugar seleccionado) */}
      {selectedPlace && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <div>
            <label className="text-sm font-medium text-slate-300">Título de la Actividad</label>
            <input
              name="title"
              required
              type="text"
              placeholder="Ej. Almuerzo en restaurante local"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300">Categoría</label>
              <select name="category" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Turismo">Turismo</option>
                <option value="Comida">Restaurante</option>
                <option value="Transporte">Transporte</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Precio Estimado (USD)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300">Notas / Descripción</label>
            <textarea
              name="description"
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detalles adicionales..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Proponer a mi acompañante'}
          </button>
        </form>
      )}
    </div>
  )
}