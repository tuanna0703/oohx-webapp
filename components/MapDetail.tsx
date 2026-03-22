'use client';
import { useEffect, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';

interface Props {
  lat: number;
  lng: number;
}

const LIBRARIES: ('places')[] = [];

export default function MapDetail({ lat, lng }: Props) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    libraries: LIBRARIES,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(containerRef.current, {
        center: { lat, lng },
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        scrollwheel: false,
        gestureHandling: 'none',
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      });

      new google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#3B47F0',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3,
          scale: 10,
        },
      });
    } else {
      mapRef.current.setCenter({ lat, lng });
    }
  }, [isLoaded, lat, lng]);

  return (
    <div
      ref={containerRef}
      id="detail-mini-map"
      className="mt-16"
      style={{ height: '180px', borderRadius: 'var(--r)', overflow: 'hidden', background: '#f7f8fc' }}
    />
  );
}
