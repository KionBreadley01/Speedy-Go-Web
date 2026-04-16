"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, Lock, Loader2, Store, Truck } from 'lucide-react';
import styles from './auth.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor, rellena los campos para continuar.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/');
    } catch (err: any) {
      console.error("Login error:", err.code);
      if (err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Ha ocurrido un error al iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Ingresa tu correo para restablecer tu contraseña.');
      return;
    }
    setResetLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage('Correo enviado. Revisa tu bandeja de entrada.');
    } catch (err: any) {
      setError('Error al enviar el correo. Verifica tu email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Lado Izquierdo: Hero Image */}
      <aside className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Speedy Go</h1>
          <p className={styles.heroSubtitle}>
            COMIDA A TU ALCANCE
          </p>
        </div>
      </aside>

      {/* Lado Derecho: Formulario */}
      <main className={styles.loginSection}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Iniciar Sesión</h2>
            <p className={styles.subtitle}>¡Qué bueno volver a verte!</p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}
          {message && (
            <div className={styles.errorAlert} style={{ backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#dcfce7' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
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
              <button
                type="button"
                onClick={handleForgotPassword}
                className={styles.forgotPassword}
                disabled={resetLoading}
              >
                {resetLoading ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
              </button>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar'}
            </button>
          </form>

          <p className={styles.footerText}>
            ¿Aún no tienes cuenta? <Link href="/register" className={styles.link}>Regístrate</Link>
          </p>
        </div>

        {/* Sección de "Únete" */}
        <section className={styles.joinSection}>
          <h3 className={styles.joinTitle}>Únete a nosotros</h3>
          <div className={styles.joinGrid}>
            <Link href="/register-restaurant" className={styles.joinItem}>
              <Store className={styles.joinItemIcon} size={24} />
              <span className={styles.joinItemLabel}>Restaurante</span>
              <span className={styles.joinItemValue}>Haz crecer tu negocio</span>
            </Link>
            <Link href="/register-driver" className={styles.joinItem}>
              <Truck className={styles.joinItemIcon} size={24} />
              <span className={styles.joinItemLabel}>Repartidor</span>
              <span className={styles.joinItemValue}>Gana en tu tiempo libre</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}