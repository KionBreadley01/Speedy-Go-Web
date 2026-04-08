"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userService } from '@/lib/services/userService';
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

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Save initial profile
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
      console.error(err);
      setError(err.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Crear Cuenta</h1>
          <p className={styles.subtitle}>Únete a Speedy Go y pide tu comida favorita.</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="firstName" className={styles.label}>Nombre</label>
              <input id="firstName" type="text" className={styles.input} required value={formData.firstName} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="lastName" className={styles.label}>Apellido</label>
              <input id="lastName" type="text" className={styles.input} required value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
            <input id="email" type="email" className={styles.input} required value={formData.email} onChange={handleChange} />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone" className={styles.label}>Teléfono</label>
            <input id="phone" type="tel" className={styles.input} required value={formData.phone} onChange={handleChange} />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input id="password" type="password" className={styles.input} required value={formData.password} onChange={handleChange} />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirmar Contraseña</label>
            <input id="confirmPassword" type="password" className={styles.input} required value={formData.confirmPassword} onChange={handleChange} />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Regístrate'}
          </button>
        </form>

        <p className={styles.footerText}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className={styles.link}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
