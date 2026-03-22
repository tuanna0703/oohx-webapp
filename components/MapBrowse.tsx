'use client';
import { useEffect, useRef } from 'react';
import type { Screen } from '@/lib/types';
import { iconSVG } from '@/lib/data';

interface Props {
  screens: Screen[];
  onScreenSelect?: (s: Screen) => void;
}

const colorMap: Record<string, string> = {
  green: '#00C48C',
  blue: '#3B47F0',
  orange: '#FF6B35',
};

export default function MapBrowse({ screens, onScreenSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!mapRef.current) {
      const map = L.map(ref.current, { zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap', maxZoom: 18,
      }).addTo(map);
      // Fit Vietnam bounding box: SW [8.4, 102.1] → NE [23.4, 109.5]
      map.fitBounds([[8.4, 102.1], [23.4, 109.5]], { padding: [24, 24] });
      mapRef.current = map;
    }

    // Clear existing markers
    if (layerRef.current) {
      layerRef.current.clearLayers();
    } else {
      const MCG = (window as any).L.MarkerClusterGroup || null;
      layerRef.current = MCG
        ? L.markerClusterGroup({
            maxClusterRadius: 15,      // nhỏ hơn → cluster theo tỉnh thay vì miền
            chunkedLoading: true,      // render dần, không block UI
            animateAddingMarkers: false,
          })
        : L.layerGroup();
      mapRef.current.addLayer(layerRef.current);
    }

    screens.forEach(s => {
      const color = colorMap[s.color] || '#3B47F0';
      const svgPath = iconSVG[s.venue] || '';
      const iconHtml = `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.25);">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="14" height="14">${svgPath}</svg>
      </div>`;
      const icon = (window as any).L.divIcon({ html: iconHtml, className: '', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -18] });
      const marker = L.marker([s.lat, s.lng], { icon });
      marker.bindPopup(`
        <div style="min-width:180px;font-family:'Open Sans',sans-serif">
          <div style="font-weight:700;font-size:13px;color:#0D0F2B;margin-bottom:4px">${s.name}</div>
          <div style="font-size:11px;color:#737899;margin-bottom:6px">${s.loc}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            <span style="font-size:10px;background:#EEF0FE;color:#3B47F0;padding:2px 6px;border-radius:4px">${s.venue}</span>
            <span style="font-size:10px;background:#F7F8FC;color:#3D4063;padding:2px 6px;border-radius:4px">${s.type}</span>
            <span style="font-size:10px;background:#F7F8FC;color:#3D4063;padding:2px 6px;border-radius:4px">${s.size}</span>
          </div>
        </div>
      `);
      if (onScreenSelect) {
        marker.on('click', () => onScreenSelect(s));
      }
      layerRef.current.addLayer(marker);
    });

    setTimeout(() => mapRef.current?.invalidateSize(), 150);
  }, [screens, onScreenSelect]);

  return <div ref={ref} id="leaflet-map" />;
}
