import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Travel Planner - Bogotá 2026',
  description: 'Organizador inteligente y colaborativo de viaje.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50 antialiased`}>
        {/* Aquí integraremos el Navbar superior y el contenedor principal en las siguientes fases */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}