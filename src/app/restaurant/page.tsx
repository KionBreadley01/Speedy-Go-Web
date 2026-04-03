// src/app/restaurant/page.tsx
"use client";

import styles from './restaurant.module.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { userService, UserProfile } from '@/lib/services/userService';
import { onAuthStateChanged, User } from 'firebase/auth';

interface RestaurantData {
  id: string;
  restaurantName: string;
  ownerName: string;
  phone: string;
  address: string;
  cuisineType: string;
}

export default function RestaurantPage() {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const profile: UserProfile | null = await userService.getUserProfile(user.uid);
          if (profile && profile.role === 'restaurant') {
            setRestaurant({
              id: user.uid,
              restaurantName: profile.restaurantName || '',
              ownerName: profile.ownerName || '',
              phone: profile.phone || '',
              address: profile.address || '',
              cuisineType: profile.cuisineType || '',
            });
          }
        } catch (error) {
          console.error('Error fetching restaurant data:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Cargando restaurante...</p>;

  if (!restaurant) return <p>No hay datos de restaurante disponibles.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Mi Restaurante</h1>
          <p className={styles.subtitle}>Información de tu negocio</p>

          {/* ✅ LINK CORREGIDO */}
          <Link href="/menu" className={styles.button}>
            + Agregar comida
          </Link>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoGroup}>
            <span className={styles.label}>Nombre del Restaurante</span>
            <div className={styles.value}>{restaurant.restaurantName}</div>
          </div>

          <div className={styles.infoGroup}>
            <span className={styles.label}>Propietario</span>
            <div className={styles.value}>{restaurant.ownerName}</div>
          </div>

          <div className={styles.infoGroup}>
            <span className={styles.label}>Teléfono</span>
            <div className={styles.value}>{restaurant.phone}</div>
          </div>

          <div className={`${styles.infoGroup} ${styles.fullWidth}`}>
            <span className={styles.label}>Dirección</span>
            <div className={styles.value}>{restaurant.address}</div>
          </div>

          <div className={`${styles.infoGroup} ${styles.fullWidth}`}>
            <span className={styles.label}>Tipo de comida</span>
            <div className={styles.value}>{restaurant.cuisineType}</div>
          </div>
        </div>
      </div>
    </div>
  );
}