"use client"

import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import styles from './settings.module.css';

export default function Settings() {
  const router = useRouter();

  const handleSignOut = async () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      await auth.signOut();
      router.push('/');
    }
  };

  const renderListItem = (title: string, value?: string, onClick?: () => void) => (
    <div className={styles.listItem} onClick={onClick}>
      <span className={styles.itemTitle}>{title}</span>
      <div className={styles.itemRight}>
        {value && <span className={styles.itemValue}>{value}</span>}
        <ChevronRight size={20} color="var(--gray-300)" />
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={24} color="var(--slate-900)" />
        </button>
        <h1 className={styles.title}>Configuración</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.block}>
          {renderListItem('Mi perfil', undefined, () => router.push('/edit-profile'))}
          <div className={styles.divider} />
          {renderListItem('Idiomas', 'Español')}
        </div>

        <div className={styles.block}>
          {renderListItem('Legal', undefined, () => router.push('/legal'))}
          <div className={styles.divider} />
          {renderListItem('Privacidad', undefined, () => router.push('/privacy'))}
        </div>

        <div className={styles.block}>
          {renderListItem('Acerca de Speedy Go', undefined, () => router.push('/about'))}
          <div className={styles.divider} />
          <div className={styles.listItem} onClick={handleSignOut}>
            <span className={styles.itemTitleSignOut}>Cerrar sesión</span>
            <ChevronRight size={20} color="var(--gray-300)" />
          </div>
        </div>
      </div>
    </div>
  );
}
