"use client"

import { useEffect } from 'react';
import { ToastProvider } from '@/components/Toast';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const markForm = (e: Event) => {
      const target = e.target as HTMLElement;
      const form = target.tagName === 'FORM' ? target as HTMLFormElement : target.closest('form');
      if (form) form.classList.add('form-submitted-attempt');
    };
    
    window.addEventListener('invalid', markForm, true);
    window.addEventListener('submit', markForm, true);
    
    return () => {
      window.removeEventListener('invalid', markForm, true);
      window.removeEventListener('submit', markForm, true);
    };
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
