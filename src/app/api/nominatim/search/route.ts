import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawQuery = searchParams.get('q')

  if (!rawQuery) {
    return NextResponse.json([])
  }

  let query = rawQuery.trim()

  // 1. NUEVO: DETECCIÓN INSTANTÁNEA DE COORDENADAS (Ej: 4.6485, -74.0776)
  // Esta expresión regular extrae la latitud y longitud sin importar qué texto haya alrededor.
  const coordRegex = /([-+]?\d{1,2}\.\d+)[,\s]+([-+]?\d{1,3}\.\d+)/
  const coordMatch = query.match(coordRegex)
  
  if (coordMatch) {
    const lat = coordMatch[1]
    const lon = coordMatch[2]
    
    // Retornamos un resultado simulado de éxito inmediato
    return NextResponse.json([{
      place_id: Date.now(), 
      display_name: `📍 Ubicación Exacta por Coordenadas (${lat}, ${lon})`,
      lat: lat,
      lon: lon
    }])
  }

  // 2. Limpieza inicial del query recibido (Fallback para direcciones de texto)
  query = query.replace(/Bogot[aá]/gi, 'Bogotá')
  query = query.replace(/Bogotá,\s*Bogotá/gi, 'Bogotá')

  const strategies: string[] = []

  let stratA = query.replace(/#/g, ' ').replace(/\s+/g, ' ').trim()
  if (!stratA.toLowerCase().includes('bogotá')) {
    stratA += ', Bogotá, Colombia'
  }
  strategies.push(stratA)

  let stratB = query.replace(/#/g, 'No. ').replace(/\s+/g, ' ').trim()
  if (!stratB.toLowerCase().includes('bogotá')) {
    stratB += ', Bogotá, Colombia'
  }
  strategies.push(stratB)

  let stratC = query.replace(/#\s*(\d+)-\d+/, '$1')
                     .replace(/No\.\s*(\d+)-\d+/, '$1')
                     .replace(/#\s*(\d+)/, '$1')
                     .replace(/\s+/g, ' ')
                     .trim()
  if (!stratC.toLowerCase().includes('bogotá')) {
    stratC += ', Bogotá, Colombia'
  }
  strategies.push(stratC)

  let mainStreet = query.split('#')[0].split(',')[0].trim()
  if (mainStreet.length > 2) {
    strategies.push(`${mainStreet}, Bogotá, Colombia`)
  }

  let firstPart = query.split(',')[0].trim()
  if (firstPart.length > 2) {
    strategies.push(`${firstPart}, Bogotá, Colombia`)
  }

  const uniqueStrategies = Array.from(new Set(strategies))

  for (const targetQuery of uniqueStrategies) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(targetQuery)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'TravelPlannerBogotaApp/1.0',
          },
          cache: 'no-store',
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          return NextResponse.json(data)
        }
      }
    } catch (error) {
      console.error(`Error ejecutando estrategia (${targetQuery}):`, error)
    }
  }

  try {
    let lastChance = query.split(',')[0].replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim() + ', Bogotá'
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lastChance)}&limit=5`,
      {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'TravelPlannerBogotaApp/1.0',
        },
        cache: 'no-store',
      }
    )
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Error en geocoding de último recurso:', error)
  }

  return NextResponse.json([])
}