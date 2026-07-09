import { createClient } from '@/shared/api/supabase/server'
import { logout } from '@/app/login/actions'
import { LogOut, Map, Plane, CalendarDays, Wallet } from 'lucide-react'
import Link from 'next/link'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y Enlaces */}
          <div className="flex items-center gap-4 md:gap-8 min-w-0">
            <Link href="/" className="flex items-center gap-1 sm:gap-2 text-white font-bold text-sm sm:text-lg hover:text-blue-400 transition-colors shrink-0">
              <Map className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              <span className="hidden sm:inline">Bogotá '26</span>
            </Link>
            <div className="flex gap-2 md:gap-6 flex-wrap">
              <Link href="/" className="flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-300 hover:text-blue-400 py-4 sm:py-5 transition-colors border-b-2 border-transparent hover:border-blue-500 whitespace-nowrap">
                <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="inline sm:hidden">Inicio</span>
              </Link>
              <Link href="/itinerario" className="flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-300 hover:text-blue-400 py-4 sm:py-5 transition-colors border-b-2 border-transparent hover:border-blue-500 whitespace-nowrap">
                <Plane className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Itinerario</span>
                <span className="inline sm:hidden">Ruta</span>
              </Link>
              <Link href="/presupuesto" className="flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-300 hover:text-emerald-400 py-4 sm:py-5 transition-colors border-b-2 border-transparent hover:border-emerald-500 whitespace-nowrap">
                <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Presupuesto</span>
                <span className="inline sm:hidden">$</span>
              </Link>
            </div>
          </div>

          {/* Usuario y Logout */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">
              {user?.email}
            </span>
            <form action={logout}>
              <button 
                type="submit" 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}