"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  style?: React.CSSProperties;
}

export default function BackButton({ style }: BackButtonProps) {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      style={{ 
        border: '1px solid var(--gray-200)', 
        background: 'var(--white)', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--slate-600)', 
        width: '48px',
        height: '48px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.2s',
        padding: 0,
        ...style
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.color = 'var(--primary)';
        e.currentTarget.style.transform = 'translateX(-4px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--gray-200)';
        e.currentTarget.style.color = 'var(--slate-600)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
      title="Regresar"
    >
      <ArrowLeft size={24} />
    </button>
  );
}
