"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
      setError('Por favor, rellena todos los campos para continuar.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    let uid: string | null = null;

    try {
      // 1. Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      uid = userCredential.user.uid;

      // 2. Guardar en coleccion drivers
      await setDoc(doc(db, 'drivers', uid), {
        name: formData.name,
        email: formData.email.trim(),
        phone: formData.phone,
        documentId: formData.documentId,
        birthDate: '', 
        vehicle: {
          type: formData.vehicleType as any,
          brand: 'N/A',
          model: 'N/A',
          plate: 'N/A',
          color: 'N/A'
        },
        zones: [],
        bankAccount: '',
        status: 'under_review', // Requiere aprobación
        currentStatus: 'offline',
        rating: 5,
        totalDeliveries: 0,
        createdAt: new Date(),
        role: 'driver'
      });

      alert("Cuenta creada exitosamente. Tu solicitud como repartidor está bajo revisión.");
      
      router.push('/');

    } catch (err: any) {
      console.error(err);

      // Rollback
      if (uid && auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (e) {
          console.error('Rollback failed:', e);
        }
      }

      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está en uso. Por favor, inicia sesión u usa otra dirección.');
      } else {
        setError(err.message || 'Error al crear la cuenta de repartidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title} style={{ color: '#0f172a' }}>Socio Repartidor</h1>
          <p className={styles.subtitle}>
            Genera ganancias entregando pedidos cuando tú quieras.
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleRegister} className={styles.form}>

          <input id="name" placeholder="Nombre completo" onChange={handleChange} required className={styles.input} />
          <input id="email" type="email" placeholder="Correo Electrónico" onChange={handleChange} required className={styles.input} />
          <input id="phone" placeholder="Celular" onChange={handleChange} required className={styles.input} />
          <input id="documentId" placeholder="Identidad / INE" onChange={handleChange} required className={styles.input} />
          
          <div className={styles.inputGroup}>
            <label htmlFor="vehicleType" className={styles.label}>Tipo de Vehículo</label>
            <select id="vehicleType" value={formData.vehicleType} onChange={handleChange} required className={styles.input} style={{ height: '45px', padding: '0 12px' }}>
              <option value="motorcycle">Motocicleta</option>
              <option value="bicycle">Bicicleta</option>
              <option value="car">Automóvil</option>
            </select>
          </div>

          <input id="password" type="password" placeholder="Contraseña" onChange={handleChange} required className={styles.input} />
          <input id="confirmPassword" type="password" placeholder="Confirmar Contraseña" onChange={handleChange} required className={styles.input} />

          <button type="submit" disabled={loading} className={styles.button} style={{ backgroundColor: '#0f172a' }}>
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <p className={styles.footerText}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className={styles.link}>Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
