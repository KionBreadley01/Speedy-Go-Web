"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { foodService } from '@/lib/services/foodService';
import styles from '../login/auth.module.css';

export default function CreateFood() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '', // aquí guardaremos la URL
    restaurantId: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null); // 🆕 archivo real

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  // 🆕 manejar subida de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      // Crear URL temporal (preview o envío simple)
      const imageUrl = URL.createObjectURL(file);

      setFormData(prev => ({
        ...prev,
        image: imageUrl
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await foodService.createFood({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image, // ⚠️ sigue siendo string
        restaurantId: formData.restaurantId
      });

      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al crear comida');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Agregar Comida</h1>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nombre</label>
            <input id="name" className={styles.input} required onChange={handleChange} />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Descripción</label>
            <input id="description" className={styles.input} required onChange={handleChange} />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Precio</label>
            <input id="price" type="number" className={styles.input} required onChange={handleChange} />
          </div>

          {/* 🆕 INPUT DE IMAGEN */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Subir imagen</label>
            <input
              type="file"
              accept="image/*"
              className={styles.input}
              onChange={handleImageChange}
              required
            />
          </div>

          {/* 🆕 PREVIEW */}
          {formData.image && (
            <img
              src={formData.image}
              alt="preview"
              style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }}
            />
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Restaurant ID</label>
            <input id="restaurantId" className={styles.input} required onChange={handleChange} />
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? 'Guardando...' : 'Crear comida'}
          </button>
        </form>
      </div>
    </div>
  );
}