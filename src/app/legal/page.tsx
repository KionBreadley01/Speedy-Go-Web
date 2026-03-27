"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function LegalPage() {
  const router = useRouter();
  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <BackButton style={{ marginBottom: '24px' }} />
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--slate-900)' }}>Aviso Legal</h1>
      <div style={{ marginTop: '32px', padding: '40px', border: '2px dashed var(--slate-200)', borderRadius: '16px', textAlign: 'center', color: 'var(--slate-400)' }}>
        <p>Este espacio está reservado para el contenido legal de Speedy Go.</p>
      </div>
    </div>
  );
}
