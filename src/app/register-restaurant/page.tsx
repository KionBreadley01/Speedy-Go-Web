"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userService } from '@/lib/services/userService';
import styles from '../login/auth.module.css';

export default function RegisterRestaurant() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    cuisineType: '',
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Guardar perfil del restaurante
      await userService.saveUserProfile(userCredential.user.uid, {
        role: 'restaurant',
        restaurantName: formData.restaurantName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        cuisineType: formData.cuisineType,
        createdAt: new Date().toISOString()
      });

      router.push('/restaurant/dashboard');
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
          <h1 className={styles.title}>Registrar Restaurante</h1>
          <p className={styles.subtitle}>
            Únete a Speedy Go y comienza a vender tus platillos.
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleRegister} className={styles.form}>
          
          <div className={styles.inputGroup}>
            <label htmlFor="restaurantName" className={styles.label}>
              Nombre del Restaurante
            </label>
            <input
              id="restaurantName"
              type="text"
              className={styles.input}
              required
              value={formData.restaurantName}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="ownerName" className={styles.label}>
              Nombre del Propietario
            </label>
            <input
              id="ownerName"
              type="text"
              className={styles.input}
              required
              value={formData.ownerName}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone" className={styles.label}>
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              className={styles.input}
              required
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="address" className={styles.label}>
              Dirección del Restaurante
            </label>
            <input
              id="address"
              type="text"
              className={styles.input}
              required
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="cuisineType" className={styles.label}>
              Tipo de Comida
            </label>
            <input
              id="cuisineType"
              type="text"
              className={styles.input}
              placeholder="Ej. Mexicana, Italiana, Fast Food"
              required
              value={formData.cuisineType}
              onChange={handleChange}
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
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={styles.input}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Registrando restaurante...' : 'Registrar Restaurante'}
          </button>
        </form>

        <p className={styles.footerText}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className={styles.link}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}