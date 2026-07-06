import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json([])
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'TravelPlannerBogotaApp/1.0',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      return NextResponse.json([], { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error consultando Nominatim:', error)
    return NextResponse.json([], { status: 500 })
  }
}