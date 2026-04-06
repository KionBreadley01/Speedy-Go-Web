"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import styles from './auth.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError('Credenciales inválidas o usuario no encontrado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Card principal (login) */}
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Iniciar sesión</h1>
          <p className={styles.subtitle}>¡Hola! Qué gusto verte de nuevo.</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Iniciando...' : 'Entrar'}
          </button>
        </form>

        {/* Registro usuario */}
        <p className={styles.footerText}>
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className={styles.link}>
            Regístrate aquí
          </Link>
        </p>
      </div>

      {/* Card separada (restaurante) */}
      <div className={styles.restaurantCard}>
        <h2 className={styles.restaurantTitle}>
          ¿Tienes un restaurante?
        </h2>
        <p className={styles.restaurantSubtitle}>
          Registra tu negocio y comienza a recibir pedidos.
        </p>

        <Link
          href="/register-restaurant"
          className={styles.restaurantButton}
        >
          Registrar restaurante
        </Link>
      </div>

    </div>
  );
}