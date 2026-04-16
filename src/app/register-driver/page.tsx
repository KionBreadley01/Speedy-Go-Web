"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, Mail, Phone, Lock, Loader2, ArrowRight, Truck, FileText } from 'lucide-react';
import styles from '../login/auth.module.css';

export default function RegisterDriver() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    documentId: '',
    vehicleType: 'motorcycle',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (Object.values(formData).some(value => value.trim() === '')) {
      setError('Por favor, rellena todos los campos.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    let uid: string | null = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      uid = userCredential.user.uid;

      await setDoc(doc(db, 'drivers', uid), {
        name: formData.name,
        email: formData.email.trim(),
        phone: formData.phone,
        documentId: formData.documentId,
        vehicle: {
          type: formData.vehicleType,
          brand: 'N/A',
          model: 'N/A',
          plate: 'N/A',
          color: 'N/A'
        },
        status: 'under_review',
        currentStatus: 'offline',
        rating: 5,
        totalDeliveries: 0,
        createdAt: new Date(),
        role: 'driver'
      });

      router.push('/');

    } catch (err: any) {
      if (uid && auth.currentUser) {
        try { await auth.currentUser.delete(); } catch (e) {}
      }
      setError('Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Socio Repartidor</h1>
          <p className={styles.heroSubtitle}>
            Sé tu propio jefe y genera ingresos entregando pedidos en tu ciudad.
          </p>
        </div>
      </aside>

      <main className={styles.loginSection}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Registrarme como Socio</h2>
            <p className={styles.subtitle}>Únete a nuestra flota de repartidores.</p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>Nombre Completo</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={18} />
                <input id="name" className={styles.input} placeholder="Juan Pérez" onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={18} />
                  <input id="email" type="email" className={styles.input} placeholder="juan@correo.com" onChange={handleChange} required />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="phone" className={styles.label}>Teléfono</label>
                <div className={styles.inputWrapper}>
                  <Phone className={styles.inputIcon} size={18} />
                  <input id="phone" className={styles.input} placeholder="10 dígitos" onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="documentId" className={styles.label}>ID de Documento (INE / Licencia)</label>
              <div className={styles.inputWrapper}>
                <FileText className={styles.inputIcon} size={18} />
                <input id="documentId" className={styles.input} placeholder="Número de identificación" onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="vehicleType" className={styles.label}>Tipo de Vehículo</label>
              <div className={styles.inputWrapper}>
                <Truck className={styles.inputIcon} size={18} />
                <select id="vehicleType" value={formData.vehicleType} onChange={handleChange} required className={styles.input} style={{ height: '48.5px', padding: '0 44px' }}>
                  <option value="motorcycle">Motocicleta</option>
                  <option value="bicycle">Bicicleta</option>
                  <option value="car">Automóvil</option>
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>Contraseña</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={18} />
                  <input id="password" type="password" className={styles.input} placeholder="••••••••" onChange={handleChange} required />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirmar</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={18} />
                  <input id="confirmPassword" type="password" className={styles.input} placeholder="••••••••" onChange={handleChange} required />
                </div>
              </div>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Registrarme <ArrowRight size={18} /></>}
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
