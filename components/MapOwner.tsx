'use client';
import { useEffect, useRef } from 'react';
import type { Screen } from '@/lib/types';
import { iconSVG } from '@/lib/data';

interface Props {
  screens: Screen[];
  center: [number, number];
}

export default function MapOwner({ screens, center }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = L.map(ref.current, { zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;

    const bounds: [number, number][] = [];
    screens.forEach(s => {
      const svgPath = iconSVG[s.venue] || '';
      const iconHtml = `<div style="width:28px;height:28px;border-radius:50%;background:var(--blue);border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(59,71,240,.4);font-size:12px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="13" height="13">${svgPath}</svg>
      </div>`;
      const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16] });
      L.marker([s.lat, s.lng], { icon }).addTo(map).bindPopup(`<strong>${s.name}</strong><br/>${s.loc}`);
      bounds.push([s.lat, s.lng]);
    });

    if (bounds.length > 0) {
      try { map.fitBounds(bounds, { padding: [40, 40] }); }
      catch { map.setView(center, 7); }
    } else {
      map.setView(center, 7);
    }

    setTimeout(() => map.invalidateSize(), 100);
  }, [screens, center]);

  return <div ref={ref} id="op-map" style={{height:'400px',borderRadius:'var(--r)',overflow:'hidden'}}/>;
}
