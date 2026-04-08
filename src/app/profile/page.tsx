"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { userService, UserProfile } from '@/lib/services/userService';

import {
  Settings,
  HelpCircle,
  Heart,
  MapPin,
  Store,
  FileText,
  LogOut,
  ChevronRight
} from 'lucide-react';

import styles from './profile.module.css';
import ConfirmModal from '@/components/ConfirmModal';

const MI_CUENTA_ITEMS = [
  { icon: Settings, label: 'Configuración', route: '/settings' },
  { icon: HelpCircle, label: 'Ayuda', route: '/incident' },
  { icon: Heart, label: 'Mis favoritos', route: '/favorites' },
  { icon: MapPin, label: 'Mi dirección', route: '/addresses?from=profile' },
];

export default function Profile() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
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
    if (profile?.role === 'restaurant') {
      return profile.restaurantName || 'Restaurante';
    }

    if (profile?.firstName) {
      return `${profile.firstName} ${profile.lastName ? profile.lastName[0] + '.' : ''}`;
    }

    return auth.currentUser?.email?.split('@')[0] || 'Usuario';
  };

  const getUserRoleLabel = () => {
    if (!profile?.role) return '';
    return profile.role === 'restaurant' ? 'Restaurante' : 'Usuario';
  };

  if (loading) {
    return <div className={styles.loading}>Cargando perfil...</div>;
  }

  return (
    <div className={styles.container}>

      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        <h1 className={styles.headerTitle}>Mi Cuenta</h1>

        <div className={styles.userInfoContainer}>
          <div className={styles.avatarCircle}>{getInitials()}</div>

          <div className={styles.userDetails}>
            <h2 className={styles.userName}>{getDisplayName()}</h2>
            <p className={styles.userRole}>{getUserRoleLabel()}</p>

            <button
              className={styles.editProfileBtn}
              onClick={() => router.push('/edit-profile')}
            >
              Editar perfil
            </button>
          </div>
        </div>

        <button className={styles.logoutBtn} onClick={handleLogoutClick}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* MAIN */}
      <div className={styles.mainContent}>

        {/* PREFERENCIAS */}
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Preferencias</h3>
          <div className={styles.listContainer}>
            {MI_CUENTA_ITEMS.map((item, index) => (
              <button
                key={index}
                className={styles.listItem}
                onClick={() => item.route && router.push(item.route)}
              >
                <div className={styles.listLeft}>
                  <div className={styles.iconWrap}>
                    <item.icon size={22} />
                  </div>
                  <span className={styles.listLabel}>{item.label}</span>
                </div>
                <ChevronRight className={styles.chevron} size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* 🔥 SOLO RESTAURANTES */}
        {profile?.role === 'restaurant' && (
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Oportunidades</h3>
            <div className={styles.listContainer}>
              {/* USANDO LINK PARA EVITAR 404 */}
              <Link href="/restaurant" className={styles.listItem}>
                <div className={styles.listLeft}>
                  <div className={styles.iconWrap}>
                    <Store size={22} />
                  </div>
                  <span className={styles.listLabel}>Ver restaurante</span>
                </div>
                <ChevronRight className={styles.chevron} size={18} />
              </Link>
            </div>
          </div>
        )}

        <button
          className={styles.floatingOrderBtn}
          onClick={() => router.push('/orders')}
        >
          <FileText size={24} />
          <span>Ver mis pedidos anteriores</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Cerrar Sesión"
        message="¿Estás seguro de que quieres cerrar tu sesión en Speedy Go?"
        confirmLabel="Cerrar Sesión"
        cancelLabel="Cancelar"
        type="danger"
      />
    </div>
  );
}