"use client"

import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon missing in React build — use local npm assets instead of CDN
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src || markerIcon2x,
  iconUrl: markerIcon.src || markerIcon,
  shadowUrl: markerShadow.src || markerShadow,
});

interface MapInnerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

// Custom hook to handle map clicks / drags
function LocationMarker({ position, setPosition, onLocationSelect }: any) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const markerRef = useRef<any>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          onLocationSelect(newPos.lat, newPos.lng);
        }
      },
    }),
    [onLocationSelect, setPosition]
  );

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

// Controller to smoothly pan the map if external props change (GPS button)
function MapLocator({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);
  return null;
}

export default function MapInner({ initialLat, initialLng, onLocationSelect }: MapInnerProps) {
  const defaultPos: [number, number] = [19.432608, -99.133209]; // CDMX default
  const [position, setPosition] = useState<any>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', zIndex: 1 }}>
      <MapContainer 
        center={position ? [position.lat, position.lng] : defaultPos} 
        zoom={position ? 16 : 5} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
        {position && <MapLocator position={[position.lat, position.lng]} />}
      </MapContainer>
    </div>
  );
}
