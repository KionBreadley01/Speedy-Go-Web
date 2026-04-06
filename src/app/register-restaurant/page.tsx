"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userService } from '@/lib/services/userService';
import { restaurantService } from '@/lib/services/restaurantService';
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
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
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
      // 🔐 Crear usuario
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const uid = userCredential.user.uid;

      // 🏪 Crear restaurante
      const restaurantId = await restaurantService.createRestaurant({
        name: formData.restaurantName,
        category: formData.cuisineType,
        rating: 0,
        deliveryTime: '30-40 min',
        deliveryFee: 0,
        image: '',
        ownerId: uid,
        createdAt: new Date().toISOString()
      });

      // 👤 Guardar usuario como restaurant_owner
      await userService.saveUserProfile(uid, {
        role: 'restaurant_owner',
        restaurantId,
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

          <input id="restaurantName" placeholder="Nombre del Restaurante" onChange={handleChange} required />
          <input id="ownerName" placeholder="Nombre del Propietario" onChange={handleChange} required />
          <input id="email" type="email" placeholder="Correo Electrónico" onChange={handleChange} required />
          <input id="phone" placeholder="Teléfono" onChange={handleChange} required />
          <input id="address" placeholder="Dirección" onChange={handleChange} required />
          <input id="cuisineType" placeholder="Tipo de Comida" onChange={handleChange} required />
          <input id="password" type="password" placeholder="Contraseña" onChange={handleChange} required />
          <input id="confirmPassword" type="password" placeholder="Confirmar Contraseña" onChange={handleChange} required />

          <button type="submit" disabled={loading}>
            {loading ? 'Registrando restaurante...' : 'Registrar Restaurante'}
          </button>
        </form>

        <p className={styles.footerText}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}