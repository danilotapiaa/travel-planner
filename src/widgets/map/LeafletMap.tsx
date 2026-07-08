'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

type MapProps = {
  activities: { id: string, lat: number, lng: number, title: string, isPending: boolean }[]
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const pinkIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const yellowIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export default function LeafletMap({ activities }: MapProps) {
  const fixedMarkers = [
    { id: 'airbnb', lat: 4.6500320829906485, lng: -74.07527937114875, title: 'Airbnb ', icon: greenIcon },
    { id: 'concierto', lat: 4.650499569614003, lng: -74.07764307961095, title: 'Concierto Rosalía', icon: pinkIcon }
  ]

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
          <Popup className="text-slate-900 min-w-[150px]">
            <div className="flex flex-col gap-2">
              <strong className="text-base">{marker.title}</strong>
              {/* NUEVO: Link para abrir directamente en Google Maps */}
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${marker.lat},${marker.lng}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
              >
                📍 Abrir en Google Maps
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}