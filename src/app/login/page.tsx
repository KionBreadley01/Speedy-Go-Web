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

    if (!email.trim() || !password.trim()) {
      setError('Por favor, rellena ambos campos para poder entrar.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/');
    } catch (err: any) {
      console.error("Firebase Login Error:", err.code, err.message);
      if (err.code === 'auth/invalid-credential') {
        setError('El correo o contraseña son incorrectos. (Verifica si hay espacios extra)');
      } else if (err.code === 'auth/user-not-found') {
        setError('No existe cuenta con este correo.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta.');
      } else {
        setError(`Error del servidor: ${err.message}`);
      }
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

      <div className={styles.sideCardsWrapper} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

        {/* Card separada (repartidor) */}
        <div className={styles.restaurantCard} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
          <h2 className={styles.restaurantTitle} style={{ color: 'white' }}>
            ¿Quieres ser socio repartidor?
          </h2>
          <p className={styles.restaurantSubtitle} style={{ color: '#94a3b8' }}>
            Únete a nuestra flota y genera ganancias en tu tiempo libre.
          </p>
          <Link
            href="/register-driver"
            className={styles.restaurantButton}
            style={{ backgroundColor: '#f97316', color: 'white' }}
          >
            Registrarme como repartidor
          </Link>
        </div>
      </div>

    </div>
  );
}