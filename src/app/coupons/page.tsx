"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CouponsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const q = query(
          collection(db, 'promotions'),
          where('active', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const promos: any[] = [];
        querySnapshot.forEach((doc) => {
          promos.push({ id: doc.id, ...doc.data() });
        });
        setPromotions(promos);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <BackButton style={{ marginBottom: '24px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Ticket size={32} color="var(--primary)" />
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--slate-900)' }}>Mis Cupones</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Cargando promociones...</div>
      ) : promotions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {promotions.map((promo) => {
            const expDate = promo.expiresAt?.toDate ? promo.expiresAt.toDate() : new Date(promo.expiresAt);
            return (
              <div key={promo.id} style={{
                display: 'flex', alignItems: 'center', backgroundColor: 'var(--white)',
                padding: '20px', borderRadius: '16px', border: '1px solid var(--gray-100)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', gap: '16px'
              }}>
                <div style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '16px', 
                  borderRadius: '12px', color: 'var(--primary)' 
                }}>
                  <Ticket size={32} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--slate-900)', marginBottom: '4px' }}>
                    Ahorra {promo.type === 'percent' ? `${promo.amount}%` : `$${promo.amount}`}
                  </h3>
                  <p style={{ color: 'var(--slate-500)', fontSize: '14px', marginBottom: '8px' }}>
                    ¡Aprovecha este cupón! (Están disponibles {promo.maxUses - (promo.usedCount || 0)} usos más)
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      backgroundColor: 'var(--gray-100)', color: 'var(--slate-700)', 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' 
                    }}>
                      Cód: {promo.code}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--slate-400)' }}>
                      Válido hasta: {expDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '60px 20px', border: '2px dashed var(--slate-200)', borderRadius: '24px', textAlign: 'center', backgroundColor: 'var(--slate-50)' }}>
          <div style={{ marginBottom: '16px', color: 'var(--slate-300)' }}>
             <Ticket size={48} style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--slate-700)', marginBottom: '8px' }}>No tienes cupones</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>Tus promociones aparecerán aquí cuando estén disponibles desde el panel.</p>
        </div>
      )}
    </div>
  );
}
