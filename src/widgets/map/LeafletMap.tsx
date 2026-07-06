'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Solución para que los íconos por defecto de Leaflet funcionen correctamente en Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Ícono personalizado (Color diferente para el concierto)
const pinkIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const markers = [
  {
    id: 'airbnb',
    lat: 4.6460, 
    lng: -74.0780,
    title: 'Airbnb (Campamento Base)',
    icon: defaultIcon
  },
  {
    id: 'concierto',
    lat: 4.6485, 
    lng: -74.0776,
    title: 'Concierto Rosalía (Movistar Arena)',
    icon: pinkIcon
  }
]

export default function LeafletMap() {
  return (
    <MapContainer 
      center={[4.647, -74.078]} 
      zoom={14} 
      className="h-[400px] w-full rounded-2xl z-0"
      zoomControl={false} // Desactivamos el control por defecto para una UI más limpia
    >
      {/* Capa de CartoDB Dark Matter para mantener el diseño elegante */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {markers.map((marker) => (
        <Marker 
          key={marker.id} 
          position={[marker.lat, marker.lng]}
          icon={marker.icon}
        >
          <Popup className="text-slate-900">
            <strong>{marker.title}</strong>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}