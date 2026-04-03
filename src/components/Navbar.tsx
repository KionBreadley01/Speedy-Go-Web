"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  MapPin,
  Search,
  ShoppingBag,
  ShoppingCart,
  Tag,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import styles from './Navbar.module.css';
import { useAddressStore } from '@/store/addressStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { orderService } from '@/lib/services/orderService';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string>('Buscando ubicación...');
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const router = useRouter();

  const currentAddress = useAddressStore((s) => s.currentAddress);
  const resetAddressStore = useAddressStore((s) => s.reset);

  const cartCount = useCartStore((s) => s.getTotalItems());

  useEffect(() => {
    setMounted(true);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const orders = await orderService.getUserOrders(currentUser.uid);
          const active = orders.filter(
            (o) => o.status !== 'delivered' && o.status !== 'cancelled'
          );
          setActiveOrdersCount(active.length);
        } catch {
          setActiveOrdersCount(0);
        }
      } else {
        // 🔥 LIMPIA TODO (memoria + localStorage)
        setActiveOrdersCount(0);
        resetAddressStore();
      }
    });

    return () => unsubscribe();
  }, [resetAddressStore]);

  useEffect(() => {
    if (mounted && !currentAddress) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
              );
              const data = await res.json();

              if (data && data.display_name) {
                setGpsLocation(data.display_name);
              } else {
                setGpsLocation('Ubicación actual');
              }
            } catch {
              setGpsLocation('Ubicación actual');
            }
          },
          () => setGpsLocation('Elige tu dirección')
        );
      } else {
        setGpsLocation('Mi ubicación actual');
      }
    }
  }, [mounted, currentAddress]);

  return (
    <header className={styles.navbar}>
      <div className={styles.leftSection}>
        <Link href="/" className={styles.logo}>
          Speedy Go
        </Link>

        <Link href="/addresses" className={styles.locationContainer}>
          <MapPin size={20} color="var(--primary)" />

          <div className={styles.locationTextContainer}>
            <div className={styles.locationText}>
              {mounted
                ? currentAddress
                  ? currentAddress.description
                  : gpsLocation
                : 'Cargando ubicación...'}
            </div>
          </div>

          <ChevronDown size={16} color="var(--slate-400)" />
        </Link>
      </div>

      <div className={styles.centerSection}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder="¿Qué se te antoja hoy?"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                router.push(`/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
              }
            }}
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        <Link href="/cart">
          <ShoppingCart size={24} />
          {cartCount > 0 && <span>{cartCount}</span>}
        </Link>

        <Link href="/orders">
          <ShoppingBag size={24} />
          {activeOrdersCount > 0 && <span>{activeOrdersCount}</span>}
        </Link>

        <Link href="/coupons">
          <Tag size={24} />
        </Link>

        {user ? (
          <div onClick={() => router.push('/profile')}>
            {user.email ? user.email[0].toUpperCase() : <UserIcon />}
          </div>
        ) : (
          <button onClick={() => router.push('/login')}>
            <UserIcon />
            <span>Iniciar sesión</span>
          </button>
        )} 
      </div>
    </header>
  );
}