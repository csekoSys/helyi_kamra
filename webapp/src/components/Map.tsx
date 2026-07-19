'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Card } from '@/components/ui/card'

export interface MapMarker {
  id: string
  name: string
  lat: number
  lng: number
  type: 'producer' | 'market' | 'center'
  address?: string
  radius_km?: number
  info?: string
}

export interface MapProps {
  center: [number, number]
  zoom: number
  markers?: MapMarker[]
  onPositionSelect?: (lat: number, lng: number) => void
  interactive?: boolean
  selectedRadiusKm?: number
}

// Helper component to handle map clicks for selecting position
function MapClickHandler({ onSelect }: { onSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onSelect) {
        onSelect(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

// Helper component to change map focus dynamically
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function Map({
  center,
  zoom,
  markers = [],
  onPositionSelect,
  interactive = true,
  selectedRadiusKm = 0,
}: MapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Fix default marker icon issues in Next.js
    // @ts-ignore
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="w-full h-full flex items-center justify-center bg-muted min-h-[300px]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p>Térkép betöltése...</p>
        </div>
      </Card>
    )
  }

  // Create custom icons to differentiate markets and producers
  const producerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  const marketIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  const centerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  return (
    <div className="w-full h-full min-h-[300px] rounded-lg overflow-hidden border border-border shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        dragging={interactive}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onPositionSelect && <MapClickHandler onSelect={onPositionSelect} />}

        {markers.map((marker) => {
          let icon = producerIcon
          if (marker.type === 'market') icon = marketIcon
          if (marker.type === 'center') icon = centerIcon

          return (
            <div key={marker.id}>
              <Marker position={[marker.lat, marker.lng]} icon={icon}>
                <Popup>
                  <div className="p-1 max-w-[200px]">
                    <h3 className="font-semibold text-sm text-foreground">{marker.name}</h3>
                    {marker.address && <p className="text-xs text-muted-foreground mt-1">{marker.address}</p>}
                    {marker.info && <p className="text-xs italic text-primary mt-1 font-medium">{marker.info}</p>}
                    {marker.type === 'producer' && (
                      <a
                        href={`/producers/${marker.id}`}
                        className="inline-block mt-2 text-xs font-semibold text-primary hover:underline"
                      >
                        Megtekintés &rarr;
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
              {marker.type === 'producer' && marker.radius_km && marker.radius_km > 0 && (
                <Circle
                  center={[marker.lat, marker.lng]}
                  radius={marker.radius_km * 1000}
                  pathOptions={{
                    fillColor: 'green',
                    fillOpacity: 0.1,
                    color: 'green',
                    weight: 1,
                    dashArray: '5, 5',
                  }}
                />
              )}
            </div>
          )
        })}

        {/* Selected radius helper for search/dashboard view */}
        {selectedRadiusKm > 0 && center[0] !== 47.4979 && (
          <Circle
            center={center}
            radius={selectedRadiusKm * 1000}
            pathOptions={{
              fillColor: '#22c55e',
              fillOpacity: 0.05,
              color: '#22c55e',
              weight: 2,
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
