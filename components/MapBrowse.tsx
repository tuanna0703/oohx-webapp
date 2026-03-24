'use client';
import { useEffect, useRef } from 'react';
import { Map, Popup, type GeoJSONSource } from 'maplibre-gl'; // CSS loaded in layout.tsx
import type { Screen } from '@/lib/types';
import { screenHref, MAPLIBRE_STYLE, VENUE_COLORS } from '@/lib/data';

interface Props {
  screens: Screen[];
}

export default function MapBrowse({ screens }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<Map | null>(null);
  const popupRef     = useRef<Popup | null>(null);
  const loadedRef    = useRef(false);
  // Ref để event handlers luôn đọc được screens mới nhất (tránh stale closure)
  const screensRef   = useRef<Screen[]>([]);

  useEffect(() => { screensRef.current = screens; }, [screens]);

  // ── Popup HTML helpers ──────────────────────────────────────────────────────

  function singlePopupHTML(p: Record<string, string>): string {
    return `
      <div style="font-family:'Open Sans',sans-serif;padding:4px">
        <div style="font-weight:700;font-size:13px;color:#0D0F2B;margin-bottom:3px">${p.name}</div>
        <div style="font-size:11px;color:#737899;margin-bottom:8px">${p.loc ?? ''}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">
          <span style="font-size:10px;background:#EEF0FE;color:#3B47F0;padding:2px 7px;border-radius:4px;font-weight:600">${p.venue}</span>
          <span style="font-size:10px;background:#F7F8FC;color:#3D4063;padding:2px 7px;border-radius:4px">${p.type}</span>
          <span style="font-size:10px;background:#F7F8FC;color:#3D4063;padding:2px 7px;border-radius:4px">${p.size}</span>
        </div>
        <a href="${screenHref(p.id)}" style="display:block;text-align:center;padding:7px;background:#3B47F0;color:#fff;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none">
          Xem chi tiết →
        </a>
      </div>`;
  }

  function listPopupHTML(items: Array<Record<string, string>>): string {
    const loc   = items[0]?.loc ?? '';
    const rows  = items.map(p => `
      <a href="${screenHref(p.id)}"
         style="display:flex;align-items:center;justify-content:space-between;padding:7px 8px;background:#F7F8FC;border-radius:6px;text-decoration:none;gap:8px;flex-shrink:0">
        <div style="min-width:0">
          <div style="font-size:12px;font-weight:600;color:#0D0F2B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
          <div style="font-size:10px;color:#737899;margin-top:1px">
            <span style="background:#EEF0FE;color:#3B47F0;padding:1px 5px;border-radius:3px;font-weight:600;margin-right:3px">${p.venue}</span>
            ${p.type} · ${p.size}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B47F0" stroke-width="2" flex-shrink="0">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>`).join('');
    return `
      <div style="font-family:'Open Sans',sans-serif;padding:4px">
        <div style="font-weight:700;font-size:13px;color:#0D0F2B;margin-bottom:2px">📍 ${loc}</div>
        <div style="font-size:11px;color:#737899;margin-bottom:8px">${items.length} màn hình tại đây</div>
        <div style="max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:3px">
          ${rows}
        </div>
      </div>`;
  }

  // ── Init map once ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new Map({
      container: containerRef.current,
      style:     MAPLIBRE_STYLE,
      center:    [106.0, 16.0],
      zoom:      5,
      minZoom:   4,
      maxZoom:   18,
      attributionControl: false,
    });

    const popup = new Popup({ closeButton: true, closeOnClick: false, maxWidth: '300px' });

    map.on('load', () => {
      map.addSource('screens', {
        type: 'geojson',
        data: buildGeoJSON([]),
        cluster:        true,
        clusterMaxZoom: 12,
        clusterRadius:  40,
      });

      map.addLayer({
        id: 'clusters', type: 'circle', source: 'screens',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color':        ['step', ['get', 'point_count'], '#3B47F0', 50, '#FF6B35', 200, '#E8430A'],
          'circle-radius':       ['step', ['get', 'point_count'], 18, 50, 24, 200, 30],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      map.addLayer({
        id: 'cluster-count', type: 'symbol', source: 'screens',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font':  ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size':  12,
        },
        paint: { 'text-color': '#fff' },
      });

      map.addLayer({
        id: 'unclustered-point', type: 'circle', source: 'screens',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color':        ['get', 'color'],
          'circle-radius':       7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // ── Click cluster ───────────────────────────────────────────────────────
      map.on('click', 'clusters', e => {
        const feat      = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0];
        const src       = map.getSource('screens') as GeoJSONSource;
        const geom      = feat.geometry as GeoJSON.Point;
        const clusterId = feat.properties?.cluster_id;

        src.getClusterExpansionZoom(clusterId).then(expansionZoom => {
          if (expansionZoom > map.getMaxZoom()) {
            // Không thể zoom thêm (tất cả cùng tọa độ) → lấy leaves và hiển thị danh sách
            src.getClusterLeaves(clusterId, 200, 0).then(leaves => {
              const items = leaves.map(l => l.properties as Record<string, string>);
              popup
                .setLngLat(geom.coordinates as [number, number])
                .setHTML(listPopupHTML(items))
                .addTo(map);
            }).catch(() => {});
          } else {
            map.easeTo({ center: geom.coordinates as [number, number], zoom: expansionZoom });
          }
        }).catch(() => {});
      });

      // ── Click unclustered marker ────────────────────────────────────────────
      // Dùng screensRef để tìm TẤT CẢ màn hình cùng tọa độ (không chỉ feature trên cùng)
      map.on('click', 'unclustered-point', e => {
        const feat = e.features?.[0];
        if (!feat) return;
        const geom       = feat.geometry as GeoJSON.Point;
        const [lng, lat] = geom.coordinates;

        // Tìm tất cả screens cùng tọa độ (epsilon 0.00001° ≈ 1m)
        const atLocation = screensRef.current.filter(s =>
          Math.abs(s.lat - lat) < 0.00001 && Math.abs(s.lng - lng) < 0.00001
        );

        if (atLocation.length <= 1) {
          // Chỉ 1 màn hình → popup đơn giản
          popup
            .setLngLat([lng, lat])
            .setHTML(singlePopupHTML(feat.properties as Record<string, string>))
            .addTo(map);
        } else {
          // Nhiều màn hình cùng địa điểm → popup danh sách
          const items = atLocation.map(s => ({
            id: s.id, name: s.name, loc: s.loc,
            venue: s.venue, type: s.type, size: s.size,
          }));
          popup
            .setLngLat([lng, lat])
            .setHTML(listPopupHTML(items))
            .addTo(map);
        }
      });

      for (const layer of ['clusters', 'unclustered-point']) {
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
      }

      map.fitBounds([[102.1, 8.4], [109.5, 23.4]], { padding: 20, duration: 0 });

      mapRef.current   = map;
      popupRef.current = popup;
      loadedRef.current = true;

      // Apply screens data nếu đã có trước khi 'load' fire
      (map.getSource('screens') as GeoJSONSource).setData(buildGeoJSON(screensRef.current));
    });

    return () => {
      popupRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current    = null;
      loadedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update data khi screens thay đổi ───────────────────────────────────────
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return;
    (mapRef.current.getSource('screens') as GeoJSONSource).setData(buildGeoJSON(screens));
  }, [screens]);

  return <div ref={containerRef} id="leaflet-map" style={{ width: '100%', height: '100%' }} />;
}

function buildGeoJSON(screens: Screen[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: screens.map(s => ({
      type: 'Feature',
      geometry:   { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: {
        id: s.id, name: s.name, loc: s.loc,
        venue: s.venue, type: s.type, size: s.size,
        color: VENUE_COLORS[s.venue] ?? '#3B47F0',
      },
    })),
  };
}
