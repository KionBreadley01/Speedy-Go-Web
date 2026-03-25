"use client"

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAddressStore } from '@/store/addressStore';
import { auth } from '@/lib/firebase';
import { orderService } from '@/lib/services/orderService';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/Toast';
import styles from './cart.module.css';
import { useState } from 'react';

export default function Cart() {
  const router = useRouter();
  const { items, getTotalPrice, removeItem, updateQuantity, clearCart, restaurantId } = useCartStore();
  const { currentAddress } = useAddressStore();
  const [placingOrder, setPlacingOrder] = useState(false);
  const { showToast } = useToast();

  const total = getTotalPrice();
  const deliveryFee = 25.00; // Fixed delivery fee for demo
  const finalTotal = total + deliveryFee;

  const handleCheckout = async () => {
    const user = auth.currentUser;
    if (!user) {
      return router.push('/login');
    }
    if (!currentAddress) {
      showToast('Selecciona una dirección de entrega primero.', 'warning');
      return router.push('/addresses');
    }

    setPlacingOrder(true);
    try {
      const orderId = await orderService.placeOrder(
        user.uid,
        restaurantId || "unknown",
        items,
        finalTotal,
        currentAddress.description || currentAddress.title
      );
      clearCart();
      router.push(`/tracking?orderId=${orderId}`);
    } catch (e) {
      console.error(e);
      showToast('Error al procesar el pedido.', 'error');
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIconCircle}>
          <ShoppingBag size={48} color="var(--slate-400)" />
        </div>
        <h1 className={styles.emptyTitle}>Tu carrito está vacío</h1>
        <p className={styles.emptySubtitle}>¿No sabes qué comer? ¡Descubre las mejores opciones locales!</p>
        <button className={styles.backBtn} onClick={() => router.push('/')}>
          Buscar comida
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tu Carrito</h1>

      <div className={styles.addressBanner}>
        <div className={styles.addressLeft}>
          <span className={styles.addressLabel}>Entregar en</span>
          <span className={styles.addressText}>{currentAddress?.title || "Seleccionar dirección"}</span>
        </div>
        <button className={styles.changeAddressBtn} onClick={() => router.push('/addresses')}>
          Cambiar
        </button>
      </div>

      <div className={styles.itemsList}>
        {items.map(item => (
          <div key={item.id} className={styles.cartItem}>
            {item.image && <img src={item.image} alt={item.name} className={styles.itemImg} />}
            <div className={styles.itemInfo}>
              <h3 className={styles.itemName}>{item.name}</h3>
              <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
            </div>
            
            <div className={styles.quantityControls}>
              <button 
                className={styles.qtyBtn}
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                {item.quantity === 1 ? <Trash2 size={16} color="var(--red-500)"/> : <Minus size={16} />}
              </button>
              <span className={styles.qtyNum}>{item.quantity}</span>
              <button 
                className={styles.qtyBtn}
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summaryBox}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Costo de envío</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className={styles.divider} />
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span>Total</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <button className={styles.checkoutBtn} onClick={handleCheckout} disabled={placingOrder}>
        {placingOrder ? 'Procesando...' : 'Pagar'}
        {!placingOrder && <ArrowRight size={20} />}
      </button>
    </div>
  );
}
