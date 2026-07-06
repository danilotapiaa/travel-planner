// Coordenadas base del Airbnb en Bogotá
const AIRBNB_LAT = 4.6460
const AIRBNB_LNG = -74.0780

export async function getTravelEstimates(destLat: number, destLng: number) {
  try {
    // 1. Petición para tiempo en Auto (Uber/Taxi)
    const carReq = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${AIRBNB_LNG},${AIRBNB_LAT};${destLng},${destLat}?overview=false`
    )
    const carData = await carReq.json()
    const carMinutes = Math.round(carData.routes[0].duration / 60)

    // 2. Petición para tiempo Caminando
    const walkReq = await fetch(
      `https://router.project-osrm.org/route/v1/foot/${AIRBNB_LNG},${AIRBNB_LAT};${destLng},${destLat}?overview=false`
    )
    const walkData = await walkReq.json()
    const walkMinutes = Math.round(walkData.routes[0].duration / 60)

    return {
      car: carMinutes,
      walk: walkMinutes,
    }
  } catch (error) {
    console.error('Error calculando ruta:', error)
    return null
  }
}
