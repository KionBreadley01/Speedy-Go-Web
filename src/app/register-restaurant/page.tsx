"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userService } from '@/lib/services/userService';
import { restaurantService } from '@/lib/services/restaurantService';
import { 
  Store, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Utensils, 
  Lock, 
  Loader2,
  ArrowRight
} from 'lucide-react';
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
        formData.email,
        formData.password
      );

      uid = userCredential.user.uid;

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

      await userService.saveRestaurantOwner(uid, {
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
          <h1 className={styles.heroTitle}>Socio Restaurante</h1>
          <p className={styles.heroSubtitle}>
            Potencia tu negocio y llega a miles de clientes hambrientos en toda la ciudad.
          </p>
        </div>
      </aside>

      <main className={styles.loginSection}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Registrar mi Negocio</h2>
            <p className={styles.subtitle}>Completa los datos para comenzar.</p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="restaurantName" className={styles.label}>Nombre del Restaurante</label>
              <div className={styles.inputWrapper}>
                <Store className={styles.inputIcon} size={18} />
                <input id="restaurantName" className={styles.input} placeholder="Speedy Pizza" onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="ownerName" className={styles.label}>Propietario</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={18} />
                <input id="ownerName" className={styles.input} placeholder="Nombre completo" onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={18} />
                  <input id="email" type="email" className={styles.input} placeholder="negocio@empresa.com" onChange={handleChange} required />
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
              <label htmlFor="address" className={styles.label}>Dirección</label>
              <div className={styles.inputWrapper}>
                <MapPin className={styles.inputIcon} size={18} />
                <input id="address" className={styles.input} placeholder="Calle 123, Colonia Centro" onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="cuisineType" className={styles.label}>Giro / Tipo de Comida</label>
              <div className={styles.inputWrapper}>
                <Utensils className={styles.inputIcon} size={18} />
                <input id="cuisineType" className={styles.input} placeholder="Ej: Pizza, Sushi, Mexicana" onChange={handleChange} required />
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