"use client"

import dynamic from 'next/dynamic';

// Next.js requires Map components dependent on the Window object to be imported without Server Side Rendering
export const MapPicker = dynamic(
  () => import('./MapInner'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '300px', backgroundColor: '#f3f4f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando mapa interactivo...</div>
  }
);
