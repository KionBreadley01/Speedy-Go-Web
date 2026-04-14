"use client"

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { restaurantService, Restaurant } from '@/lib/services/restaurantService';
import { Product } from '@/store/cartStore';
import { ArrowLeft, Star, Clock } from 'lucide-react';
import styles from './restaurantDetail.module.css';

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const [restData, prodsData] = await Promise.all([
          restaurantService.getRestaurantById(id),
          restaurantService.getProductsByRestaurant(id)
        ]);
        setRestaurant(restData);
        setProducts(prodsData);
      } catch (err) {
        console.error("Error fetching restaurant or products:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchRestaurantData();
  }, [id]);

  if (loading) return <div className={styles.loading}>Cargando restaurante...</div>;
  if (!restaurant) return <div className={styles.loading}>Restaurante no encontrado.</div>;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => router.back()}>
        <ArrowLeft size={20} style={{ marginRight: '8px' }} />
        Volver
      </button>

      <div className={styles.hero}>
        <img 
          src={restaurant.image || 'https://via.placeholder.com/1200x300'} 
          alt={restaurant.name} 
          className={styles.heroImg} 
        />
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>{restaurant.name}</h1>
            <p className={styles.category}>{restaurant.category}</p>
            
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <Star size={16} fill="white" color="white" />
                <span>{restaurant.rating || "4.5"}</span>
              </div>
              <div className={styles.statItem}>
                <Clock size={16} />
                <span>{restaurant.deliveryTime || "20-30 min"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Menú</h2>

      {products.length > 0 ? (
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div 
              key={product.id} 
              className={styles.productCard}
              onClick={() => router.push(`/product/${product.id}`)}
            >
              <div className={styles.productImgWrapper}>
                <img 
                  src={product.image || 'https://via.placeholder.com/300x200'} 
                  alt={product.name} 
                  className={styles.productImg} 
                />
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDesc}>{product.description}</p>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>${product.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          Este restaurante aún no tiene productos registrados.
        </div>
      )}
    </div>
  );
}
