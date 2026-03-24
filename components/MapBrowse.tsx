'use client';
import { useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Screen } from '@/lib/types';
import { screenHref } from '@/lib/data';

interface Props {
  screens: Screen[];
  onScreenSelect?: (s: Screen) => void;
}

const COLOR_BY_VENUE: Record<string, string> = {
  Retail:  '#3B47F0',
  Outdoor: '#00C48C',
  'F&B':   '#FF6B35',
  Transit: '#F59E0B',
  Office:  '#8B5CF6',
};

export default function MapBrowse({ screens, onScreenSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<import('maplibre-gl').Map | null>(null);
  const popupRef     = useRef<import('maplibre-gl').Popup | null>(null);

  // Khởi tạo map một lần
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    let map: import('maplibre-gl').Map;

    import('maplibre-gl').then(({ Map, Popup }) => {
      if (mapRef.current || !containerRef.current) return;

      map = new Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center:  [106.0, 16.0],
        zoom:    5,
        minZoom: 4,
        maxZoom: 18,
        attributionControl: false,
      });

      popupRef.current = new Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: '260px',
      });

      map.on('load', () => {
        // ── GeoJSON source với built-in clustering ──────────────────
        map.addSource('screens', {
          type: 'geojson',
          data: buildGeoJSON([]),
          cluster: true,
          clusterMaxZoom: 12,
          clusterRadius: 40,
        });

        // Cluster circle
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'screens',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step', ['get', 'point_count'],
              '#3B47F0',  50,
              '#FF6B35', 200,
              '#E8430A',
            ],
            'circle-radius': [
              'step', ['get', 'point_count'],
              18,  50,
              24, 200,
              30,
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
          },
        });

        // Cluster count label
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'screens',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font':  ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size':  12,
          },
          paint: {
            'text-color': '#ffffff',
          },
        });

        // Individual marker
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'screens',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color':        ['get', 'color'],
            'circle-radius':       7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Click cluster → zoom in
        map.on('click', 'clusters', e => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          const clusterId = features[0].properties?.cluster_id;
          const src = map.getSource('screens') as import('maplibre-gl').GeoJSONSource;
          const geom = features[0].geometry as GeoJSON.Point;
          src.getClusterExpansionZoom(clusterId).then((zoom: number) => {
            map.easeTo({ center: geom.coordinates as [number, number], zoom });
          }).catch(() => {});
        });

        // Click individual marker → popup
        map.on('click', 'unclustered-point', e => {
          const f = e.features?.[0];
          if (!f) return;
          const p    = f.properties as Record<string, string>;
          const geom = f.geometry as GeoJSON.Point;
          const [lng, lat] = geom.coordinates;

          popupRef.current!
            .setLngLat([lng, lat])
            .setHTML(`
              <div style="font-family:'Open Sans',sans-serif;padding:4px">
                <div style="font-weight:700;font-size:13px;color:#0D0F2B;margin-bottom:3px">${p.name}</div>
                <div style="font-size:11px;color:#737899;margin-bottom:8px">${p.loc}</div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">
                  <span style="font-size:10px;background:#EEF0FE;color:#3B47F0;padding:2px 7px;border-radius:4px;font-weight:600">${p.venue}</span>
                  <span style="font-size:10px;background:#F7F8FC;color:#3D4063;padding:2px 7px;border-radius:4px">${p.type}</span>
                  <span style="font-size:10px;background:#F7F8FC;color:#3D4063;padding:2px 7px;border-radius:4px">${p.size}</span>
                </div>
                <a href="${screenHref(p.id)}" style="display:block;text-align:center;padding:7px;background:#3B47F0;color:#fff;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none">
                  Xem chi tiết →
                </a>
              </div>
            `)
            .addTo(map);

          if (onScreenSelect) {
            onScreenSelect({
              id: p.id, name: p.name, loc: p.loc,
              venue: p.venue, type: p.type as Screen['type'],
              size: p.size, lat, lng,
              color: p.color as Screen['color'],
              thumb: p.thumb as Screen['thumb'],
              weekly: Number(p.weekly),
              price_per_slot_vnd: Number(p.price_per_slot_vnd),
            } as Screen);
          }
        });

        // Cursor
        map.on('mouseenter', 'clusters',           () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'clusters',           () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'unclustered-point',  () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'unclustered-point',  () => { map.getCanvas().style.cursor = ''; });

        // Fit Vietnam
        map.fitBounds([[102.1, 8.4], [109.5, 23.4]], { padding: 20, duration: 0 });
      });

      mapRef.current = map;
    });

    return () => {
      map?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cập nhật data khi screens thay đổi
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource('screens')) return;

    const src = map.getSource('screens') as import('maplibre-gl').GeoJSONSource;
    src.setData(buildGeoJSON(screens));
  }, [screens]);

  return (
    <div
      ref={containerRef}
      id="leaflet-map"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function buildGeoJSON(screens: Screen[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: screens.map(s => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: {
        id:                 s.id,
        name:               s.name,
        loc:                s.loc,
        venue:              s.venue,
        type:               s.type,
        size:               s.size,
        color:              COLOR_BY_VENUE[s.venue] ?? '#3B47F0',
        thumb:              s.thumb,
        weekly:             s.weekly,
        price_per_slot_vnd: s.price_per_slot_vnd,
      },
    })),
  };
}
