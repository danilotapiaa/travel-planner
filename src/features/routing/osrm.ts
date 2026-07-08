'use server'

// Coordenadas base del Airbnb en Bogotá por defecto
const AIRBNB_LAT = 4.6500320829906485
const AIRBNB_LNG = -74.07527937114875

// Función auxiliar: Calcula la distancia en línea recta entre dos coordenadas (en metros)
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radio de la tierra en metros
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

export async function getTravelEstimates(destLat: number, destLng: number, origLat: number = AIRBNB_LAT, origLng: number = AIRBNB_LNG) {
  try {
    // 1. Configuramos un "AbortController" para cortar la petición si OSRM tarda más de 2 segundos
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    const req = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origLng},${origLat};${destLng},${destLat}?overview=false`,
      { signal: controller.signal }
    )
    
    clearTimeout(timeoutId) // Limpiamos el timeout si la petición responde a tiempo

    if (!req.ok) throw new Error('OSRM limit reached')
    
    const data = await req.json()
    const route = data.routes?.[0]

    if (!route) throw new Error('No route found')

    // --- CÁLCULO CON OSRM ---
    const trafficMultiplier = 1.35; 
    const carMinutes = Math.round((route.duration * trafficMultiplier) / 60)
    const walkMinutes = Math.round(route.distance / 83.33)

    return { car: carMinutes, walk: walkMinutes }

  } catch (error) {
    // 2. PLAN B: Si OSRM da ETIMEDOUT o bloquea por hacer muchas peticiones, entramos aquí
    // console.warn('OSRM falló, usando estimación matemática offline...');
    
    // Obtenemos la distancia en línea recta
    const straightDistance = calculateHaversineDistance(origLat, origLng, destLat, destLng);
    
    // Las calles en una ciudad no son líneas rectas. Agregamos un "factor de desvío" del 40% (x1.4)
    const urbanDistance = straightDistance * 1.4;

    // --- CÁLCULO ESTIMADO OFFLINE ---
    // Carro: Asumimos una velocidad promedio con tráfico de 25 km/h (aprox 416 metros por minuto)
    const carMinutes = Math.round(urbanDistance / 416);
    
    // Caminando: Velocidad promedio de 5 km/h (aprox 83.33 metros por minuto)
    const walkMinutes = Math.round(urbanDistance / 83.33);

    // Evitar que devuelva 0 minutos si está muy cerca
    return { 
      car: carMinutes === 0 ? 1 : carMinutes, 
      walk: walkMinutes === 0 ? 1 : walkMinutes 
    }
  }
}