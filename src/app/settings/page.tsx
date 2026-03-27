"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { ArrowLeft, ChevronRight, User, Globe, Shield, Scale, Info, LogOut } from 'lucide-react';
import styles from './settings.module.css';
import ConfirmModal from '@/components/ConfirmModal';
import BackButton from '@/components/BackButton';

export default function Settings() {
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleSignOutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await auth.signOut();
    router.push('/');
  };

  const renderListItem = (
    title: string, 
    Icon: React.ElementType, 
    value?: string, 
    onClick?: () => void,
    isDanger?: boolean
  ) => (
    <div className={styles.listItem} onClick={onClick}>
      <div className={styles.itemLeft}>
        <div className={`${styles.iconWrap} ${isDanger ? styles.iconWrapDanger : ''}`}>
          <Icon size={20} />
        </div>
        <span className={`${styles.itemTitle} ${isDanger ? styles.itemTitleDanger : ''}`}>{title}</span>
      </div>
      <div className={styles.itemRight}>
        {value && <span className={styles.itemValue}>{value}</span>}
        <ChevronRight size={18} className={styles.chevron} />
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <BackButton />
        <h1 className={styles.title}>Configuración</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionLabel}>Cuenta y Perfil</h3>
          {renderListItem('Mi perfil', User, undefined, () => router.push('/edit-profile'))}
          <div className={styles.divider} />
          {renderListItem('Idioma', Globe, 'Español')}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionLabel}>Soporte y Legal</h3>
          {renderListItem('Políticas de Privacidad', Shield, undefined, () => router.push('/privacy'))}
          <div className={styles.divider} />
          {renderListItem('Aviso Legal', Scale, undefined, () => router.push('/legal'))}
          <div className={styles.divider} />
          {renderListItem('Acerca de Speedy Go', Info, undefined, () => router.push('/about'))}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionLabel}>Sesión</h3>
          {renderListItem('Cerrar sesión', LogOut, undefined, handleSignOutClick, true)}
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar tu sesión en Speedy Go?"
        confirmLabel="Cerrar Sesión"
        cancelLabel="Cancelar"
        type="danger"
      />
    </div>
  );
}
