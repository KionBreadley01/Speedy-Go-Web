"use client"

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { MapPin, Search, ShoppingBag, ShoppingCart, Tag, User as UserIcon, ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';
import { useAddressStore } from '@/store/addressStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { orderService } from '@/lib/services/orderService';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string>('Buscando ubicación...');
  const { currentAddress } = useAddressStore();
  const cartCount = useCartStore((s) => s.getTotalItems());
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const orders = await orderService.getUserOrders(currentUser.uid);
          const active = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
          setActiveOrdersCount(active.length);
        } catch { /* ignorar */ }
      } else {
        setActiveOrdersCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (mounted && !currentAddress) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
              const data = await res.json();
              if (data && data.display_name) {
                setGpsLocation(data.display_name);
              } else {
                setGpsLocation('Ubicación actual');
              }
            } catch (e) {
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
          <div className={styles.locationIconWrap}>
            <MapPin size={20} color="var(--primary)" />
          </div>
          <div className={styles.locationTextContainer}>
            <div className={styles.locationText}>
              {mounted ? (currentAddress ? currentAddress.description : gpsLocation) : 'Cargando ubicación...'}
            </div>
          </div>
          <div className={styles.chevronWrap}>
            <ChevronDown size={16} color="var(--slate-400)" />
          </div>
        </Link>
      </div>

      <div className={styles.centerSection}>
        <div className={styles.searchBar}>
          <Search size={20} color="var(--slate-400)" />
          <input 
            type="text" 
            placeholder="¿Qué se te antoja hoy?" 
            className={styles.searchInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                router.push(`/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
              }
            }}
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        <Link href="/cart" className={styles.navButton}>
          <div className={styles.iconWrap}>
            <ShoppingCart size={24} />
            {mounted && cartCount > 0 && (
              <span className={styles.badge}>{cartCount > 9 ? '9+' : cartCount}</span>
            )}
          </div>
          <span className={styles.navButtonText}>Carrito</span>
        </Link>
        
        <Link href="/orders" className={styles.navButton}>
          <div className={styles.iconWrap}>
            <ShoppingBag size={24} />
            {mounted && activeOrdersCount > 0 && (
              <span className={styles.badge}>{activeOrdersCount > 9 ? '9+' : activeOrdersCount}</span>
            )}
          </div>
          <span className={styles.navButtonText}>Pedidos</span>
        </Link>
        
        <Link href="/coupons" className={styles.navButton}>
          <Tag size={24} />
          <span className={styles.navButtonText}>Cupones</span>
        </Link>
        
        {user ? (
          <div className={styles.userAvatar} onClick={() => router.push('/profile')} title={user.email || 'Perfil'}>
            {user.email ? user.email[0].toUpperCase() : <UserIcon size={20} />}
          </div>
        ) : (
          <button className={styles.authButton} onClick={() => router.push('/login')}>
            <UserIcon size={20} />
            <span>Iniciar sesión</span>
          </button>
        )}
      </div>
    </header>
  );
}
