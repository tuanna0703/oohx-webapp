'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Map, type GeoJSONSource } from 'maplibre-gl'; // CSS loaded in layout.tsx
import type { Screen } from '@/lib/types';
import { screenHref, MAPLIBRE_STYLE, VENUE_COLORS } from '@/lib/data';

interface Props {
  screens: Screen[];
}

interface PopupState {
  lngLat: [number, number];
  html: string;
}

export default function MapBrowse({ screens }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<Map | null>(null);
  const loadedRef    = useRef(false);
  const screensRef   = useRef<Screen[]>([]);

  const [popup,    setPopup]    = useState<PopupState | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => { screensRef.current = screens; }, [screens]);

  // Re-project popup position whenever map moves or popup changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !popup) { setPopupPos(null); return; }

    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pt   = map.project(popup.lngLat);
      setPopupPos({ x: rect.left + pt.x, y: rect.top + pt.y });
    };

    update();
    map.on('move', update);
    return () => { map.off('move', update); };
  }, [popup]);

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
    const loc  = items[0]?.loc ?? '';
    const rows = items.map(p => `
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
        <div style="display:flex;flex-direction:column;gap:3px;max-height:240px;overflow-y:auto">
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
            src.getClusterLeaves(clusterId, 200, 0).then(leaves => {
              const items = leaves.map(l => l.properties as Record<string, string>);
              setPopup({ lngLat: geom.coordinates as [number, number], html: listPopupHTML(items) });
            }).catch(() => {});
          } else {
            map.easeTo({ center: geom.coordinates as [number, number], zoom: expansionZoom });
          }
        }).catch(() => {});
      });

      // ── Click unclustered marker ────────────────────────────────────────────
      map.on('click', 'unclustered-point', e => {
        const feat = e.features?.[0];
        if (!feat) return;
        const geom       = feat.geometry as GeoJSON.Point;
        const [lng, lat] = geom.coordinates;

        const atLocation = screensRef.current.filter(s =>
          Math.abs(s.lat - lat) < 0.00001 && Math.abs(s.lng - lng) < 0.00001
        );

        const lngLat: [number, number] = [lng, lat];
        if (atLocation.length <= 1) {
          setPopup({ lngLat, html: singlePopupHTML(feat.properties as Record<string, string>) });
        } else {
          const items = atLocation.map(s => ({
            id: s.id, name: s.name, loc: s.loc,
            venue: s.venue, type: s.type, size: s.size,
          }));
          setPopup({ lngLat, html: listPopupHTML(items) });
        }
      });

      // Close popup when clicking empty map area
      map.on('click', e => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters', 'unclustered-point'] });
        if (features.length === 0) setPopup(null);
      });

      for (const layer of ['clusters', 'unclustered-point']) {
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
      }

      map.fitBounds([[102.1, 8.4], [109.5, 23.4]], { padding: 20, duration: 0 });

      mapRef.current    = map;
      loadedRef.current = true;

      (map.getSource('screens') as GeoJSONSource).setData(buildGeoJSON(screensRef.current));
    });

    return () => {
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

  return (
    <>
      <div ref={containerRef} id="leaflet-map" style={{ width: '100%', height: '100%' }} />

      {/* Portal popup — renders on document.body, overlays everything including footer */}
      {popup && popupPos && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position:     'fixed',
            left:         popupPos.x,
            top:          popupPos.y,
            transform:    'translate(-50%, calc(-100% - 14px))',
            zIndex:       9999,
            background:   '#fff',
            borderRadius: '12px',
            boxShadow:    '0 4px 24px rgba(13,15,43,0.18)',
            width:        '300px',
            pointerEvents:'auto',
            padding:      '12px',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setPopup(null)}
            style={{
              position:'absolute', top:8, right:8,
              width:22, height:22,
              background:'rgba(0,0,0,0.08)', border:'none',
              borderRadius:'50%', cursor:'pointer',
              fontSize:16, lineHeight:'22px', textAlign:'center', color:'#3D4063',
            }}
          >×</button>

          {/* Caret */}
          <div style={{
            position:'absolute', bottom:-7, left:'50%', transform:'translateX(-50%)',
            width:14, height:7, overflow:'hidden',
          }}>
            <div style={{
              width:14, height:14, background:'#fff',
              boxShadow:'0 4px 24px rgba(13,15,43,0.18)',
              transform:'rotate(45deg)', transformOrigin:'top left',
              marginLeft:0,
            }}/>
          </div>

          <div dangerouslySetInnerHTML={{ __html: popup.html }} />
        </div>,
        document.body,
      )}
    </>
  );
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
