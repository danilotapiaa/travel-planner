import { createClient } from '@/shared/api/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/features/auth/ui/login-form'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams
  const error = searchParams?.error as string | undefined

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Decoración de fondo suave */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-sm rounded-2xl bg-slate-900/80 p-8 shadow-2xl border border-slate-800 backdrop-blur-sm z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Travel Planner</h1>
          <p className="mt-2 text-sm text-slate-400">Bogotá 2026</p>
        </div>
        
        <LoginForm error={error} />
      </div>
    </div>
  )
}