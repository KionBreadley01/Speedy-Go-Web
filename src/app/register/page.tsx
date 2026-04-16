"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userService } from '@/lib/services/userService';
import { User, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import styles from '../login/auth.module.css';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (Object.values(formData).some(value => value.trim() === '')) {
      setError('Por favor, rellena todos los campos para continuar.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      await userService.saveUserProfile(userCredential.user.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: 'user',
        dob: '',
        gender: ''
      });

      router.push('/');
    } catch (err: any) {
      console.error("Registration Error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil.');
      } else {
        setError('Error al crear la cuenta. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Únete a Speedy Go</h1>
          <p className={styles.heroSubtitle}>
            Disfruta de la mejor comida de tu ciudad, entregada con rapidez y profesionalismo.
          </p>
        </div>
      </aside>

      <main className={styles.loginSection}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Crear Cuenta</h2>
            <p className={styles.subtitle}>Comienza tu experiencia hoy mismo.</p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName" className={styles.label}>Nombre</label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} size={18} />
                  <input id="firstName" value={formData.firstName} onChange={handleChange} required className={styles.input} placeholder="Juan" />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="lastName" className={styles.label}>Apellido</label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} size={18} />
                  <input id="lastName" value={formData.lastName} onChange={handleChange} required className={styles.input} placeholder="Pérez" />
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input id="email" type="email" value={formData.email} onChange={handleChange} required className={styles.input} placeholder="tu@correo.com" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>Teléfono</label>
              <div className={styles.inputWrapper}>
                <Phone className={styles.inputIcon} size={18} />
                <input id="phone" type="tel" value={formData.phone} onChange={handleChange} required className={styles.input} placeholder="10 dígitos" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input id="password" type="password" value={formData.password} onChange={handleChange} required className={styles.input} placeholder="••••••••" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirmar Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className={styles.input} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Regístrate'}
            </button>
          </form>

          <p className={styles.footerText}>
            ¿Ya tienes cuenta? <Link href="/login" className={styles.link}>Inicia sesión</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
