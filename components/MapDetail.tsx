'use client';
import { useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Props {
  lat: number;
  lng: number;
}

export default function MapDetail({ lat, lng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<import('maplibre-gl').Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let map: import('maplibre-gl').Map;

    import('maplibre-gl').then(({ Map, Marker }) => {
      if (!containerRef.current) return;

      map = new Map({
        container: containerRef.current,
        style:  'https://tiles.openfreemap.org/styles/liberty',
        center: [lng, lat],
        zoom:   15,
        interactive:        false,
        attributionControl: false,
      });

      map.on('load', () => {
        // Marker
        const el = document.createElement('div');
        el.style.cssText = `
          width:18px;height:18px;
          background:#3B47F0;
          border:3px solid #fff;
          border-radius:50%;
          box-shadow:0 2px 6px rgba(59,71,240,.4);
        `;
        new Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
      });

      mapRef.current = map;
    });

    return () => {
      map?.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      id="detail-mini-map"
      className="mt-16"
      style={{ height: '180px', borderRadius: 'var(--r)', overflow: 'hidden', background: '#f7f8fc' }}
    />
  );
}
