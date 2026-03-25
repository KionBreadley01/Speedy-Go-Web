"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { orderService, Order, OrderStatus } from '@/lib/services/orderService';
import { ChevronLeft, CheckCircle2, Box, Truck, Home, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react';
import { MapPicker } from '@/components/MapPicker';
import { useToast } from '@/components/Toast';
import styles from './tracking.module.css';

function TrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { showToast } = useToast();

  // Generate a fake ETA (30 min from now)
  const [eta] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  });

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    const unsubscribe = orderService.subscribeToOrder(orderId, (fetchedOrder) => {
      if (fetchedOrder) {
        setOrder(fetchedOrder);
        setStatus(fetchedOrder.status);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [orderId]);

  const handleCancelOrder = () => {
    if (!orderId || (status !== 'pending' && status !== 'accepted')) return;
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!orderId) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(orderId);
      setShowCancelModal(false);
      router.push('/orders');
    } catch {
      setShowCancelModal(false);
      showToast('No se pudo cancelar el pedido.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const getSteps = () => {
    const statuses: OrderStatus[] = ['pending', 'preparing', 'delivering', 'delivered'];
    const currentIndex = statuses.indexOf(status);
    return [
      { id: 'pending', icon: CheckCircle2, label: 'Pedido confirmado', done: currentIndex >= 0, active: currentIndex === 0 },
      { id: 'preparing', icon: Box, label: 'Preparando tu pedido', done: currentIndex >= 1, active: currentIndex === 1 },
      { id: 'delivering', icon: Truck, label: 'En camino', done: currentIndex >= 2, active: currentIndex === 2 },
      { id: 'delivered', icon: Home, label: 'Entregado', done: currentIndex >= 3, active: currentIndex === 3 },
    ];
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 size={32} className="spin" />
        <p>Cargando estado del pedido...</p>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className={styles.loadingState}>
        <p>No se encontró el pedido.</p>
        <button className={styles.backToHomeBtn} onClick={() => router.push('/')}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Nav */}
      <div className={styles.topNav}>
        <button className={styles.backBtn} onClick={() => router.push('/orders')}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.navTitle}>Estado del Pedido</h1>
        <div className={styles.helpBadge}>
          <span className={styles.helpText}>Ayuda</span>
        </div>
      </div>

      {/* ETA */}
      <div className={styles.etaSection}>
        <span className={styles.etaLabel}>LLEGADA ESTIMADA</span>
        <span className={styles.etaTime}>{eta}</span>
        <div className={styles.onTimeBadge}>
          <span className={styles.onTimeDot}>●</span>
          <span className={styles.onTimeText}>En tiempo</span>
        </div>
      </div>

      {/* Horizontal Split: Map | Steps */}
      <div className={styles.splitLayout}>
        {/* Map */}
        <div className={styles.mapWrap}>
          <MapPicker initialLat={19.41} initialLng={-98.44} onLocationSelect={() => {}} />
          <div className={styles.pinWrap}>
            <div className={styles.pingRing} />
            <div className={styles.riderPin}>
              <Truck size={20} color="var(--white)" />
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className={styles.stepsContainer}>
          {getSteps().map((step, i) => {
            const IconComp = step.icon;
            return (
              <div key={i} className={`${styles.stepCard} ${step.active ? styles.stepCardActive : ''}`}>
                <div className={`${styles.stepIcon} ${step.active ? styles.stepIconActive : ''}`}>
                  <IconComp size={20} color={step.active ? 'var(--primary)' : '#64748b'} />
                </div>
                <span className={`${styles.stepLabel} ${step.active ? styles.stepLabelActive : ''}`}>
                  {step.label}
                </span>
                {step.done && <CheckCircle2 size={20} color="#22c55e" />}
              </div>
            );
          })}

          {(status === 'pending' || status === 'accepted') && (
            <button className={styles.cancelBtn} onClick={handleCancelOrder}>
              Cancelar pedido
            </button>
          )}

          <button className={styles.completedLink} onClick={() => router.push('/orders')}>
            Simular entrega completada <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Order Items */}
      {order?.items && order.items.length > 0 && (
        <div className={styles.itemsCard}>
          <h3 className={styles.itemsCardTitle}>Tu pedido</h3>
          {order.items.map((item, index) => (
            <div key={index} className={styles.itemRow}>
              <div className={styles.itemQtyBadge}>
                <span className={styles.itemQtyText}>{item.quantity}x</span>
              </div>
              <div className={styles.itemDetails}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className={styles.modalOverlay} onClick={() => !cancelling && setShowCancelModal(false)}>
          <div className={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap}>
              <AlertTriangle size={28} color="#EF4444" />
            </div>
            <h2 className={styles.modalTitle}>Cancelar pedido</h2>
            <p className={styles.modalDesc}>
              ¿Estás seguro de que quieres cancelar este pedido? Esta acción no se puede deshacer.
            </p>
            <button
              className={styles.modalConfirmBtn}
              onClick={confirmCancel}
              disabled={cancelling}
            >
              {cancelling ? <Loader2 size={20} className="spin" /> : 'Sí, cancelar pedido'}
            </button>
            <button
              className={styles.modalKeepBtn}
              onClick={() => setShowCancelModal(false)}
              disabled={cancelling}
            >
              No, mantener pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="spin" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
