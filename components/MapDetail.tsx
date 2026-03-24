'use client';
import { useEffect, useRef } from 'react';
import { Map, Marker } from 'maplibre-gl'; // CSS loaded in layout.tsx
import { MAPLIBRE_STYLE } from '@/lib/data';

interface Props {
  lat: number;
  lng: number;
}

export default function MapDetail({ lat, lng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<Map | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new Map({
      container: containerRef.current,
      style:     MAPLIBRE_STYLE,
      center:    [lng, lat],
      zoom:      15,
      interactive:        false,
      attributionControl: false,
    });

    map.on('load', () => {
      const el = document.createElement('div');
      el.style.cssText = 'width:18px;height:18px;background:#3B47F0;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(59,71,240,.4)';
      new Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
    });

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Init once; position updates handled by separate effect
  }, []);

  // Pan to new position without full reinit
  useEffect(() => {
    mapRef.current?.setCenter([lng, lat]);
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
