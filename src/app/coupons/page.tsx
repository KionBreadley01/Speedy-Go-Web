"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Ticket } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function CouponsPage() {
  const router = useRouter();
  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <BackButton style={{ marginBottom: '24px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Ticket size={32} color="var(--primary)" />
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--slate-900)' }}>Mis Cupones</h1>
      </div>
      <div style={{ padding: '60px 20px', border: '2px dashed var(--slate-200)', borderRadius: '24px', textAlign: 'center', backgroundColor: 'var(--slate-50)' }}>
        <div style={{ marginBottom: '16px', color: 'var(--slate-300)' }}>
           <Ticket size={48} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--slate-700)', marginBottom: '8px' }}>No tienes cupones aún</h2>
        <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>Tus promociones aparecerán aquí cuando estén disponibles.</p>
      </div>
    </div>
  );
}
