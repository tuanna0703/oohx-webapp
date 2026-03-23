'use client';
import { useEffect, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Screen } from '@/lib/types';
import { screenHref } from '@/lib/data';

interface Props {
  screens: Screen[];
  onScreenSelect?: (s: Screen) => void;
}

const colorMap: Record<string, string> = {
  green:  '#00C48C',
  blue:   '#3B47F0',
  orange: '#FF6B35',
};

const LIBRARIES: never[] = [];

export default function MapBrowse({ screens, onScreenSelect }: Props) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    libraries: LIBRARIES,
  });

  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<google.maps.Map | null>(null);
  const clustererRef  = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markersRef    = useRef<google.maps.Marker[]>([]);

  // Khởi tạo map một lần
  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapRef.current) return;

    const map = new google.maps.Map(containerRef.current, {
      center:           { lat: 16.0, lng: 106.0 }, // Trung tâm Việt Nam — tránh geolocation request
      zoom:             6,
      mapTypeControl:   false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControlOptions: { position: google.maps.ControlPosition.LEFT_TOP },
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });

    map.fitBounds(
      new google.maps.LatLngBounds({ lat: 8.4, lng: 102.1 }, { lat: 23.4, lng: 109.5 })
    );

    infoWindowRef.current = new google.maps.InfoWindow();
    mapRef.current = map;
  }, [isLoaded]);

  // Cập nhật markers khi screens thay đổi
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    clustererRef.current?.clearMarkers();
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const map       = mapRef.current;
    const infoWindow = infoWindowRef.current!;

    const markers = screens.map(s => {
      const color = colorMap[s.color] ?? '#3B47F0';

      const marker = new google.maps.Marker({
        position: { lat: s.lat, lng: s.lng },
        icon: {
          path:          google.maps.SymbolPath.CIRCLE,
          fillColor:     color,
          fillOpacity:   1,
          strokeColor:   '#fff',
          strokeWeight:  2,
          scale:         7,
        },
      });

      marker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="font-family:'Open Sans',sans-serif;padding:12px;min-width:200px;max-width:240px">
            <div style="font-weight:700;font-size:13px;color:#0D0F2B;margin-bottom:4px">${s.name}</div>
            <div style="font-size:11px;color:#737899;margin-bottom:8px">${s.loc}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">
              <span style="font-size:10px;background:#EEF0FE;color:#3B47F0;padding:2px 7px;border-radius:4px;font-weight:600">${s.venue}</span>
              <span style="font-size:10px;background:#F7F8FC;color:#3D4063;padding:2px 7px;border-radius:4px">${s.type}</span>
              <span style="font-size:10px;background:#F7F8FC;color:#3D4063;padding:2px 7px;border-radius:4px">${s.size}</span>
            </div>
            <a href="${screenHref(s.id)}" style="display:block;text-align:center;padding:7px;background:#3B47F0;color:#fff;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none">
              Xem chi tiết →
            </a>
          </div>
        `);
        infoWindow.open({ anchor: marker, map });
        if (onScreenSelect) onScreenSelect(s);
      });

      return marker;
    });

    markersRef.current = markers;

    // Custom renderer dùng Marker thay vì AdvancedMarkerElement (tránh lỗi mapId)
    const renderer = {
      render({ count, position }: { count: number; position: google.maps.LatLng }) {
        const size   = count > 500 ? 56 : count > 100 ? 48 : 40;
        const color  = count > 500 ? '#E8430A' : count > 100 ? '#FF6B35' : '#3B47F0';
        return new google.maps.Marker({
          position,
          icon: {
            path:        google.maps.SymbolPath.CIRCLE,
            fillColor:   color,
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
            scale:       size / 5,
          },
          label: {
            text:     String(count),
            color:    '#fff',
            fontSize: '12px',
            fontWeight: '700',
          },
          zIndex: 1000 + count,
        });
      },
    };

    clustererRef.current = new MarkerClusterer({ map, markers, renderer });
  }, [screens, onScreenSelect, isLoaded]);

  if (!isLoaded) {
    return (
      <div id="leaflet-map" style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'#f7f8fc', color:'#737899', fontSize:'14px', gap:'8px' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:'spin 1s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Đang tải bản đồ...
      </div>
    );
  }

  return <div ref={containerRef} id="leaflet-map" />;
}
