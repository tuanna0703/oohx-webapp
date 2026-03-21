'use client'

import { useEffect, useRef } from 'react'
import type { Screen } from '@/lib/types'
import { formatPrice } from '@/lib/data'

interface MapViewProps {
  screens: Screen[]
  center?: [number, number]
  zoom?: number
  height?: string
  onScreenSelect?: (screen: Screen) => void
}

export default function MapView({
  screens,
  center = [16.0, 106.0],
  zoom = 6,
  height = '100%',
  onScreenSelect,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!mapRef.current) return
    if (mapInstanceRef.current) return // already initialized

    // Dynamically import leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import('leaflet')).default

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      })
      mapInstanceRef.current = map

      // OSM tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Color map for pins
      const colorHex: Record<string, string> = {
        green: '#00C48C',
        blue: '#3B47F0',
        orange: '#FF6B35',
      }

      // Try to load markercluster
      let markerGroup: ReturnType<typeof L.featureGroup>
      try {
        await import('leaflet.markercluster')
        // @ts-expect-error markercluster extends L at runtime
        markerGroup = L.markerClusterGroup({
          maxClusterRadius: 50,
          iconCreateFunction: (cluster: { getChildCount: () => number }) => {
            const count = cluster.getChildCount()
            return L.divIcon({
              html: `<div style="background:#3B47F0;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${count}</div>`,
              className: '',
              iconSize: [36, 36],
            })
          },
        })
      } catch {
        markerGroup = L.featureGroup()
      }

      // Add markers
      screens.forEach((screen) => {
        const color = colorHex[screen.color] || '#3B47F0'

        const icon = L.divIcon({
          html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28],
        })

        const marker = L.marker([screen.lat, screen.lng], { icon })
        marker.bindPopup(`
          <div style="font-family:'Open Sans',sans-serif;min-width:200px">
            <div style="font-weight:700;font-size:14px;color:#0D0F2B;margin-bottom:4px">${screen.name}</div>
            <div style="font-size:12px;color:#737899;margin-bottom:8px">📍 ${screen.loc}</div>
            <div style="display:flex;gap:8px;margin-bottom:8px">
              <span style="padding:2px 8px;background:#EEF0FE;color:#3B47F0;border-radius:20px;font-size:11px;font-weight:600">${screen.venue}</span>
              <span style="padding:2px 8px;background:#F7F8FC;color:#3D4063;border-radius:20px;font-size:11px">${screen.size}</span>
            </div>
            <div style="font-size:13px;font-weight:700;color:#0D0F2B">${formatPrice(screen.weekly)}<span style="font-weight:400;color:#737899;font-size:11px">/tuần</span></div>
            <a href="/screens/${screen.id}" style="display:block;margin-top:10px;text-align:center;padding:7px;background:#3B47F0;color:white;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none">Xem chi tiết →</a>
          </div>
        `)

        if (onScreenSelect) {
          marker.on('click', () => onScreenSelect(screen))
        }

        markerGroup.addLayer(marker)
      })

      map.addLayer(markerGroup)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when screens change
  useEffect(() => {
    // Map will reinitialize if needed
  }, [screens])

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden z-10"
    />
  )
}
