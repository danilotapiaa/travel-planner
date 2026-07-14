# Travel Planner

Aplicación web (Next.js) para planificar viajes en grupo: itinerarios en mapa, presupuesto compartido y votación de actividades. Backend en Supabase.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) — auth y datos
- **Tailwind CSS v4** + `shadcn`/`class-variance-authority`
- **Leaflet / react-leaflet** — mapas
- **OSRM** y **Nominatim** — routing y geocoding (vía API routes propias)
- Arquitectura tipo *feature-sliced design*: `entities/`, `features/`, `widgets/`, `shared/`

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Requiere variables de entorno de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en `.env.local`.

## Estructura

```
src/
├─ app/                 # Rutas (App Router): login, itinerario, presupuesto, api/nominatim
├─ features/            # Lógica de negocio por dominio: activities, auth, budget, routing
├─ widgets/             # Bloques de UI compuestos: map, itinerary, budget, navbar, activities
├─ entities/            # Modelos/entidades del dominio
├─ shared/              # Cliente Supabase, config, ui/lib compartidos
├─ components/ui/       # Componentes base (shadcn)
└─ lib/utils.ts
```

## Estado actual

Proyecto en desarrollo activo. Funcionalidades presentes: login vía Supabase, mapa de itinerario con Leaflet, gestión de presupuesto (crear/editar ítems), votación de actividades, búsqueda de lugares (Nominatim) y ruteo (OSRM).
