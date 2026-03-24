'use client';
import { useEffect, useRef } from 'react';
import { Map, Popup, type GeoJSONSource } from 'maplibre-gl'; // CSS loaded in layout.tsx
import type { Screen } from '@/lib/types';
import { screenHref, MAPLIBRE_STYLE, VENUE_COLORS } from '@/lib/data';

interface Props {
  screens: Screen[];
  onScreenSelect?: (s: Screen) => void;
}

export default function MapBrowse({ screens, onScreenSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<Map | null>(null);
  const popupRef     = useRef<Popup | null>(null);
  const loadedRef    = useRef(false); // tracks map 'load' event fired

  // Init map once
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

    const popup = new Popup({ closeButton: true, closeOnClick: false, maxWidth: '260px' });

    map.on('load', () => {
      map.addSource('screens', {
        type: 'geojson',
        data: buildGeoJSON([]),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 40,
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'screens',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#3B47F0', 50, '#FF6B35', 200, '#E8430A'],
          'circle-radius': ['step', ['get', 'point_count'], 18, 50, 24, 200, 30],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'screens',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#fff' },
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'screens',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Click cluster → zoom in
      map.on('click', 'clusters', e => {
        const feat = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0];
        const src  = map.getSource('screens') as GeoJSONSource;
        const geom = feat.geometry as GeoJSON.Point;
        src.getClusterExpansionZoom(feat.properties?.cluster_id)
          .then(zoom => map.easeTo({ center: geom.coordinates as [number, number], zoom }))
          .catch(() => {});
      });

      // Click marker → popup
      map.on('click', 'unclustered-point', e => {
        const feat = e.features?.[0];
        if (!feat) return;
        const p    = feat.properties as Record<string, string>;
        const geom = feat.geometry as GeoJSON.Point;
        const [lng, lat] = geom.coordinates;

        popup
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
          const screen = screens.find(s => s.id === p.id);
          if (screen) onScreenSelect(screen);
        }
      });

      for (const layer of ['clusters', 'unclustered-point']) {
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
      }

      map.fitBounds([[102.1, 8.4], [109.5, 23.4]], { padding: 20, duration: 0 });

      mapRef.current  = map;
      popupRef.current = popup;
      loadedRef.current = true;

      // Apply any screens data that arrived before 'load' fired
      const src = map.getSource('screens') as GeoJSONSource;
      src.setData(buildGeoJSON(screens));
    });

    return () => {
      popupRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current  = null;
      loadedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Init runs once; screens applied inside 'load' handler on first mount
  }, []);

  // Update data whenever screens change (only after map is loaded)
  useEffect(() => {
    if (!loadedRef.current || !mapRef.current) return;
    const src = mapRef.current.getSource('screens') as GeoJSONSource;
    src.setData(buildGeoJSON(screens));
  }, [screens]);

  return <div ref={containerRef} id="leaflet-map" style={{ width: '100%', height: '100%' }} />;
}

function buildGeoJSON(screens: Screen[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: screens.map(s => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: {
        id: s.id, name: s.name, loc: s.loc,
        venue: s.venue, type: s.type, size: s.size,
        color: VENUE_COLORS[s.venue] ?? '#3B47F0',
      },
    })),
  };
}
