import { createClient } from '@/shared/api/supabase/server'
import { logout } from '@/app/login/actions'
import { LogOut, Map, Plane, CalendarDays } from 'lucide-react'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y Enlaces */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Map className="h-6 w-6 text-blue-500" />
              <span>Bogotá '26</span>
            </div>
            <div className="hidden md:flex gap-4">
              <span className="flex items-center gap-1 text-sm font-medium text-blue-400 border-b-2 border-blue-500 py-5">
                <CalendarDays className="h-4 w-4" /> Dashboard
              </span>
              <span className="flex items-center gap-1 text-sm font-medium text-slate-400 py-5 hover:text-slate-200 cursor-pointer transition-colors">
                <Plane className="h-4 w-4" /> Itinerario
              </span>
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