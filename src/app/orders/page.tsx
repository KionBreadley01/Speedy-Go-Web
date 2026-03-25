"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { orderService, Order } from '@/lib/services/orderService';
import { Check, X, Clock, ShoppingBag, Truck, ShoppingCart } from 'lucide-react';
import styles from './orders.module.css';

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await orderService.getUserOrders(user.uid);
          setOrders(data);
        } catch (error) {
          console.error("Error loading orders:", error);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const activeOrders = orders.filter(o => ['pending', 'accepted', 'preparing', 'delivering'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const renderOrderStatus = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <div className={styles.statusRow}>
            <Check size={14} color="var(--success)" />
            <span className={styles.deliveredText}>Entregado</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className={styles.statusRow}>
            <X size={14} color="var(--red-500)" />
            <span className={styles.cancelledText}>Cancelado</span>
          </div>
        );
      default:
        return (
          <div className={styles.statusRow}>
            <Clock size={14} color="var(--primary)" />
            <span className={styles.pendingText}>En proceso</span>
          </div>
        );
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando pedidos...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis Pedidos</h1>
        <button className={styles.cartIconBtn} onClick={() => router.push('/cart')}>
          <ShoppingCart size={24} color="var(--slate-900)" />
        </button>
      </div>

      <div className={styles.content}>
        {activeOrders.map(activeOrder => (
          <div 
            key={activeOrder.id} 
            className={styles.activeBanner}
            onClick={() => router.push(`/tracking?orderId=${activeOrder.id}`)}
          >
            <div className={styles.activeLeft}>
              <div className={styles.iconCircle}>
                <Truck size={22} color="var(--white)" />
              </div>
              <div>
                <span className={styles.activeStatus}>
                  {activeOrder.status === 'delivering' ? 'En camino' : 'En proceso'}
                </span>
                <h3 className={styles.activeRestaurant}>Tu pedido #{activeOrder.id?.substring(0, 4)}</h3>
              </div>
            </div>
            <span className={styles.chevron}>&gt;</span>
          </div>
        ))}

        <h2 className={styles.historyLabel}>Historial</h2>

        {pastOrders.length === 0 && activeOrders.length === 0 ? (
          <div className={styles.emptyState}>Aún no tienes pedidos.</div>
        ) : (
          pastOrders.map(order => (
            <div key={order.id} className={styles.pastOrderCard}>
              <div className={styles.pastOrderRow}>
                <div className={styles.pastOrderLogoPlaceholder}>
                  <ShoppingBag size={20} color="var(--slate-500)" />
                </div>
                <div className={styles.pastOrderInfo}>
                  <h3 className={styles.pastOrderName}>Pedido #{order.id?.substring(0, 6)}</h3>
                  <span className={styles.pastOrderMeta}>
                    {formatDate(order.createdAt)} • {order.items?.length || 0} artículos
                  </span>
                  {renderOrderStatus(order.status)}
                </div>
                <span className={styles.pastOrderTotal}>${order.totalAmount.toFixed(2)}</span>
              </div>
              <button 
                className={styles.reorderBtn}
                onClick={() => router.push(`/tracking?orderId=${order.id}`)}
              >
                Ver detalles
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
