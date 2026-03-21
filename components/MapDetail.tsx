'use client';
import { useEffect, useRef } from 'react';

interface Props {
  lat: number;
  lng: number;
}

export default function MapDetail({ lat, lng }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = L.map(ref.current, { zoomControl: false, dragging: false, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(map);
    map.setView([lat, lng], 15);
    L.circleMarker([lat, lng], { radius: 8, fillColor: '#3B47F0', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
  }, [lat, lng]);

  return <div ref={ref} id="detail-mini-map" className="mt-16" style={{height:'180px',borderRadius:'var(--r)',overflow:'hidden'}}/>;
}
