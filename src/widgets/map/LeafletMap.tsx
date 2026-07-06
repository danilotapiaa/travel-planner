'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

type MapProps = {
  activities: { id: string, lat: number, lng: number, title: string, isPending: boolean }[]
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', // Azul
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const pinkIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png', // Concierto
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const yellowIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png', // Pendientes
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', // Airbnb
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export default function LeafletMap({ activities }: MapProps) {
  const fixedMarkers = [
    { id: 'airbnb', lat: 4.6460, lng: -74.0780, title: 'Airbnb (Campamento Base)', icon: greenIcon },
    { id: 'concierto', lat: 4.6485, lng: -74.0776, title: 'Concierto Rosalía', icon: pinkIcon }
  ]

  // Combinamos los fijos con los dinámicos de Supabase
  const dynamicMarkers = activities.map(act => ({
    id: act.id,
    lat: act.lat,
    lng: act.lng,
    title: act.title + (act.isPending ? ' (Pendiente)' : ''),
    icon: act.isPending ? yellowIcon : defaultIcon
  }))

  const allMarkers = [...fixedMarkers, ...dynamicMarkers]

  return (
    <MapContainer center={[4.647, -74.078]} zoom={14} className="h-[400px] w-full rounded-2xl z-0" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {allMarkers.map((marker) => (
        <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={marker.icon}>
          <Popup className="text-slate-900"><strong>{marker.title}</strong></Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}