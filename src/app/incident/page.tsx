"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import styles from './incident.module.css';

export default function Incident() {
  const router = useRouter();
  const [form, setForm] = useState({ subject: '', description: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.description) return;
    setSent(true);
    setTimeout(() => {
      router.back();
    }, 2500);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={24} color="var(--slate-900)" />
        </button>
        <h1 className={styles.title}>Ayuda y Soporte</h1>
      </header>

      <div className={styles.content}>
        {sent ? (
          <div className={styles.successState}>
            <div className={styles.iconCircle}>
              <Send size={32} color="var(--primary)" />
            </div>
            <h2>Mensaje Enviado</h2>
            <p>Hemos recibido tu reporte. Nuestro equipo de soporte se pondrá en contacto contigo muy pronto a través de tu correo electrónico registrado.</p>
          </div>
        ) : (
          <>
            <p className={styles.subtitle}>
              ¿Tienes algún problema con un pedido o con la aplicación? Déjanos un mensaje y te ayudaremos lo antes posible.
            </p>

            <form className={styles.formContainer} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Asunto</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Ej. Problema con mi último pedido" 
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Descripción</label>
                <textarea 
                  className={styles.textarea} 
                  placeholder="Cuéntanos más detalles sobre tu problema..." 
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                Enviar Reporte
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
