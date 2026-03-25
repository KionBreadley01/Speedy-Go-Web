"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { userService, UserProfile } from '@/lib/services/userService';
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './edit-profile.module.css';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
  });

  const [alert, setAlert] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        return router.push('/login');
      }

      try {
        const data = await userService.getUserProfile(user.uid);
        if (data) {
          setForm({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: user.email || '',
            phone: data.phone || '',
            dob: data.dob || '',
            gender: data.gender || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    setAlert(null);
    try {
      await userService.saveUserProfile(user.uid, form);
      setAlert({ type: 'success', msg: 'Perfil actualizado correctamente.' });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', msg: 'No se pudo guardar el perfil.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Cargando perfil...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={24} color="var(--slate-900)" />
        </button>
        <h1 className={styles.title}>Editar Perfil</h1>
        <div style={{ width: 44 }}></div>
      </header>

      {alert && (
        <div className={alert.type === 'success' ? styles.alertSuccess : styles.alertError}>
          {alert.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{alert.msg}</span>
        </div>
      )}

      <form className={styles.formContainer} onSubmit={handleSave}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Nombre</label>
          <input 
            type="text" 
            className={styles.input} 
            value={form.firstName} 
            onChange={e => setForm({ ...form, firstName: e.target.value })} 
            placeholder="Tu nombre" 
            required 
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Apellido</label>
          <input 
            type="text" 
            className={styles.input} 
            value={form.lastName} 
            onChange={e => setForm({ ...form, lastName: e.target.value })} 
            placeholder="Tu apellido" 
            required 
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Correo electrónico</label>
          <input 
            type="email" 
            className={`${styles.input} ${styles.disabledInput}`} 
            value={form.email} 
            disabled 
          />
          <span className={styles.hint}>El correo no puede ser modificado</span>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Celular</label>
          <input 
            type="tel" 
            className={styles.input} 
            value={form.phone} 
            onChange={e => setForm({ ...form, phone: e.target.value })} 
            placeholder="Tu celular" 
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Fecha de nacimiento</label>
          <input 
            type="date" 
            className={styles.input} 
            value={form.dob} 
            onChange={e => setForm({ ...form, dob: e.target.value })} 
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Género</label>
          <div className={styles.genderRow}>
            {['Hombre', 'Mujer', 'Sin definir'].map(option => (
              <button
                key={option}
                type="button"
                className={`${styles.genderChip} ${form.gender === option ? styles.genderActive : ''}`}
                onClick={() => setForm({ ...form, gender: option as UserProfile['gender'] })}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
