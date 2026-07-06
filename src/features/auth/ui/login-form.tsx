'use client'

import { login } from '@/app/login/actions'

export function LoginForm({ error }: { error?: string }) {
  return (
    <form action={login} className="flex flex-col space-y-4">
      {error && (
        <div className="rounded-md bg-red-900/50 px-3 py-2 text-sm text-red-200 border border-red-800 text-center font-medium">
          {error}
        </div>
      )}
      
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-300">
          Correo Electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="viajero@ejemplo.com"
        />
      </div>
      
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-300">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="••••••••"
        />
      </div>
      
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 mt-2 shadow-md shadow-blue-900/20"
      >
        Ingresar al Viaje
      </button>
    </form>
  )
}