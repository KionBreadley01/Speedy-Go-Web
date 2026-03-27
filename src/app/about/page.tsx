"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import BackButton from '@/components/BackButton';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)',
      padding: '40px',
      backgroundColor: 'var(--white)',
      position: 'relative'
    }}>
      <BackButton style={{ position: 'absolute', top: '40px', left: '40px' }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'fadeInUp 0.8s ease-out'
      }}>
        <div style={{
          width: '350px',
          height: '350px',
          backgroundColor: 'var(--gray-50)',
          borderRadius: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '10px',
          boxShadow: '0 20px 60px rgba(231, 22, 22, 0.1)',
          border: '10px solid var(--white)'
        }}>
          <Image
            src="/assets/images/android-icon-monochrome.png"
            alt="Logo de Speedy Go"
            width={280}
            height={280}
            style={{ objectFit: 'contain', borderRadius: '20%' }}
          />
        </div>

        <h1 style={{
          fontSize: '38px',
          fontWeight: '900',
          color: 'var(--slate-900)',
          margin: 0,
          letterSpacing: '-0.04em'
        }}>
          Speedy Go
        </h1>

        <p style={{
          marginTop: '12px',
          fontSize: '16px',
          color: 'var(--slate-400)',
          fontWeight: '500'
        }}>
          Versión 1.0.0
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
