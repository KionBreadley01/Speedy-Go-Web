"use client"

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, Product } from '@/store/cartStore';
import { restaurantService } from '@/lib/services/restaurantService';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import styles from './product.module.css';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { addItem, restaurantId, clearCart } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const prod = await restaurantService.getProductById(id);
        setProduct(prod);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    if (restaurantId && restaurantId !== product.restaurantId) {
      if (confirm("Este producto es de otro restaurante. ¿Deseas vaciar tu carrito para agregarlo?")) {
        clearCart();
        // The store handles setting the novel ID upon first item addition
      } else {
        return;
      }
    }

    addItem(product, quantity);
    router.push('/cart');
  };

  if (loading) return <div className={styles.loading}>Cargando producto...</div>;
  if (!product) return <div className={styles.loading}>Producto no encontrado.</div>;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => router.back()}>
        <ArrowLeft size={24} color="var(--slate-900)" />
      </button>

      <div className={styles.productLayout}>
        <div className={styles.imgWrapper}>
          <img src={product.image || 'https://via.placeholder.com/800'} alt={product.name} className={styles.img} />
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.desc}>{product.description}</p>
          <div className={styles.priceRow}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
          </div>

          <div className={styles.actionsBox}>
            <div className={styles.qtyControl}>
              <button 
                className={styles.qtyBtn} 
                disabled={quantity <= 1} 
                onClick={() => setQuantity(q => q - 1)}
              >
                <Minus size={20} />
              </button>
              <span className={styles.qtyNum}>{quantity}</span>
              <button 
                className={styles.qtyBtn} 
                onClick={() => setQuantity(q => q + 1)}
              >
                <Plus size={20} />
              </button>
            </div>
            <button className={styles.addBtn} onClick={handleAddToCart}>
              Agregar • ${(product.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
