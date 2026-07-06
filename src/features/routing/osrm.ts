'use server'

// Coordenadas base del Airbnb en Bogotá por defecto
const AIRBNB_LAT = 4.6460
const AIRBNB_LNG = -74.0780

export async function getTravelEstimates(destLat: number, destLng: number, origLat: number = AIRBNB_LAT, origLng: number = AIRBNB_LNG) {
  try {
    // 1. Petición para tiempo en Auto (Uber/Taxi)
    const carReq = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origLng},${origLat};${destLng},${destLat}?overview=false`
    )
    const carData = await carReq.json()
    const carMinutes = carData.routes?.[0] ? Math.round(carData.routes[0].duration / 60) : 0

    // 2. Petición para tiempo Caminando
    const walkReq = await fetch(
      `https://router.project-osrm.org/route/v1/foot/${origLng},${origLat};${destLng},${destLat}?overview=false`
    )
    const walkData = await walkReq.json()
    const walkMinutes = walkData.routes?.[0] ? Math.round(walkData.routes[0].duration / 60) : 0

    return {
      car: carMinutes,
      walk: walkMinutes,
    }
  } catch (error) {
    console.error('Error calculando ruta:', error)
    return null
  }
}