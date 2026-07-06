import { PlaneTakeoff, PlaneLanding, MapPin, Ticket, Clock, Music } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { Plane } from "lucide-react";
import { TripMap } from '@/widgets/map/TripMap'
import { CreateActivityForm } from '@/features/activities/ui/CreateActivityForm'
import { PendingActivitiesWidget } from '@/widgets/activities/PendingActivitiesWidget'
import { BudgetWidget } from '@/widgets/budget/BudgetWidget'
export default function Home() {
  // Cálculo de cuenta regresiva
  const tripDate = new Date('2026-07-15T16:40:00-05:00')
  const today = new Date()
  const daysLeft = differenceInDays(tripDate, today)

  return (
    <div className="space-y-6 sm:space-y-8 flex flex-col pb-10 px-4 sm:px-6 lg:px-0">
      
      {/* Header del Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 sm:px-0">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Resumen del Viaje</h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">Tu itinerario y próximos eventos están bajo control.</p>
        </div>
        
        {/* Widget Cuenta Regresiva */}
        <div className="flex items-center gap-3 bg-blue-900/20 border border-blue-800/50 px-4 sm:px-5 py-3 rounded-xl shadow-lg shadow-blue-900/10 w-full sm:w-auto">
          <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-300 uppercase tracking-wider">Faltan</p>
            <p className="text-xl sm:text-2xl font-bold text-white leading-none">{daysLeft} días</p>
          </div>
        </div>
      </div>

      <PendingActivitiesWidget />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Principal (Vuelos y Alojamiento) */}
        <div className="lg:col-span-2 space-y-6">
          
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <PlaneTakeoff className="h-5 w-5 text-slate-400" /> Vuelos Confirmados
          </h2>
          
          {/* Tarjeta de Vuelo Ida */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20 mb-2">
                  Ida • 15 Jul 2026
                </span>
                <h3 className="font-medium text-lg text-white">Quito (UIO) a Bogotá (BOG)</h3>
                <p className="text-sm text-slate-400 mt-1">Avianca • AV1664 / AV8394 • Escala en Guayaquil</p>
              </div>
              <Ticket className="h-6 w-6 text-slate-600" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Salida</span>
                <span className="text-xl font-bold text-white mt-1">16:40</span>
                <span className="text-sm text-slate-400">UIO - Mariscal Sucre</span>
              </div>
              
              <div className="hidden sm:flex flex-1 items-center justify-center relative">
                <div className="w-full h-[1px] bg-slate-700 absolute"></div>
                <Plane className="h-4 w-4 text-slate-500 bg-slate-950/50 z-10 px-1" />
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Llegada</span>
                <span className="text-xl font-bold text-white mt-1">20:45</span>
                <span className="text-sm text-slate-400">BOG - Terminal 1</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-start gap-2 bg-yellow-900/20 border border-yellow-800/30 p-3 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200/80">
                <strong>Recordatorio:</strong> Debes salir hacia el aeropuerto a las 13:40 (3 horas de anticipación).
              </p>
            </div>
          </div>

          {/* Tarjeta de Alojamiento */}
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2 mt-8 mb-4">
            <MapPin className="h-5 w-5 text-slate-400" /> Alojamiento
          </h2>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-medium text-lg text-white">Airbnb Bogotá</h3>
                <p className="text-slate-400 mt-1">2717 Diagonal 61D, Bogotá 111221</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1">Check-in</span>
                    <span className="text-white font-medium">Mié 15 Jul • ~22:00</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1">Check-out</span>
                    <span className="text-white font-medium">Dom 19 Jul • 12:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Columna Lateral (Eventos y Regreso) */}
        <div className="space-y-6">
          
          {/* Evento Principal */}
          <div className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-800/50 rounded-2xl p-6 shadow-lg shadow-pink-900/10">
            <div className="h-10 w-10 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
              <Music className="h-5 w-5 text-pink-400" />
            </div>
            <span className="inline-flex items-center rounded-full bg-pink-500/20 px-2.5 py-0.5 text-xs font-medium text-pink-300 ring-1 ring-inset ring-pink-500/30 mb-2">
              Evento Principal
            </span>
            <h3 className="font-bold text-xl text-white">Concierto Rosalía</h3>
            <p className="text-pink-200/80 mt-2 text-sm">Movistar Arena Bogotá</p>
            <p className="text-white font-medium mt-1">Jueves 16 de Julio • 21:00</p>
            
            <div className="mt-4 pt-4 border-t border-pink-800/50">
              <p className="text-xs text-pink-300/80 uppercase tracking-wider font-medium mb-2">Actividad Obligatoria Pendiente</p>
              <div className="flex items-center gap-2 text-sm text-pink-100 bg-pink-950/50 p-2 rounded border border-pink-900/50">
                <Ticket className="h-4 w-4 shrink-0" />
                <span>Retirar boletos físicos (Horario por definir)</span>
              </div>
            </div>
          </div>

          {/* Resumen Vuelo Regreso */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
            <h3 className="font-medium text-white flex items-center gap-2 mb-4">
              <PlaneLanding className="h-4 w-4 text-slate-400" /> Vuelo de Regreso
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Fecha</span>
                <span className="text-white font-medium">19 Jul 2026</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Ruta</span>
                <span className="text-white font-medium">BOG → UIO</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Horario</span>
                <span className="text-white font-medium">11:25 - 13:05</span>
              </div>
            </div>
          </div>

          <CreateActivityForm />

        </div>
      </div>

      <div className="mt-8">
        <BudgetWidget />
      </div>

      {/* Sección del Mapa (Fase 3) */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-slate-400" /> Mapa del Viaje
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm">
          <TripMap />
        </div>
      </div>

    </div>
  )
}