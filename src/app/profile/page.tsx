"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { userService, UserProfile } from '@/lib/services/userService';
import { Settings, HelpCircle, Heart, MapPin, Truck, Store, FileText, LogOut } from 'lucide-react';
import styles from './profile.module.css';

const MI_CUENTA_ITEMS = [
  { icon: Settings, label: 'Configuración', route: '/settings' },
  { icon: HelpCircle, label: 'Ayuda', route: '/incident' },
  { icon: Heart, label: 'Mis favoritos', route: '/favorites' },
  { icon: MapPin, label: 'Mi dirección', route: '/addresses' },
];

const OTROS_ITEMS = [
  { icon: Truck, label: 'Sé socio repartidor', route: null },
  { icon: Store, label: 'Abrir una tienda', route: null },
];

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await userService.getUserProfile(user.uid);
          setProfile(data);
        } catch (e) {
          console.error(e);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    return 'US';
  };

  const getDisplayName = () => {
    if (profile?.firstName) {
      return `${profile.firstName} ${profile.lastName ? profile.lastName[0] + '.' : ''}`;
    }
    return auth.currentUser?.email?.split('@')[0] || 'Usuario';
  };

  if (loading) {
    return <div className={styles.loading}>Cargando perfil...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.headerTitle}>Cuenta</h1>

      <div className={styles.userInfoContainer}>
        <div className={styles.avatarCircle}>{getInitials()}</div>
        <div className={styles.userDetails}>
          <h2 className={styles.userName}>{getDisplayName()}</h2>
          <button className={styles.editProfileBtn} onClick={() => router.push('/edit-profile')}>
            Editar perfil &gt;
          </button>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Mi cuenta</h3>
        <div className={styles.listContainer}>
          {MI_CUENTA_ITEMS.map((item, index) => (
            <button
              key={index}
              className={styles.listItem}
              onClick={() => item.route && router.push(item.route)}
            >
              <div className={styles.listLeft}>
                <div className={styles.iconWrap}>
                  <item.icon size={20} color="var(--slate-700)" />
                </div>
                <span className={styles.listLabel}>{item.label}</span>
              </div>
              <span className={styles.chevron}>&gt;</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Otros</h3>
        <div className={styles.listContainer}>
          {OTROS_ITEMS.map((item, index) => (
            <button key={index} className={styles.listItem}>
              <div className={styles.listLeft}>
                <div className={styles.iconWrap}>
                  <item.icon size={20} color="var(--slate-700)" />
                </div>
                <span className={styles.listLabel}>{item.label}</span>
              </div>
              <span className={styles.chevron}>&gt;</span>
            </button>
          ))}
          <button className={styles.listItem} onClick={handleLogout}>
              <div className={styles.listLeft}>
                <div className={styles.iconWrap}>
                  <LogOut size={20} color="var(--red-500)" />
                </div>
                <span className={styles.listLabel} style={{ color: 'var(--red-500)' }}>Cerrar Sesión</span>
              </div>
          </button>
        </div>
      </div>

      <button className={styles.floatingOrderBtn} onClick={() => router.push('/orders')}>
        <FileText size={20} />
        <span>Ver pedidos</span>
      </button>
    </div>
  );
}
