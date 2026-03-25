"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { userService } from '@/lib/services/userService';
import { restaurantService, Restaurant } from '@/lib/services/restaurantService';
import { Product } from '@/store/cartStore';
import { ArrowLeft, Star, Clock, Trash2, Heart } from 'lucide-react';
import styles from './favorites.module.css';

export default function Favorites() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'restaurants'>('products');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      const user = auth.currentUser;
      if (!user) return router.push('/login');

      setLoading(true);
      try {
        if (activeTab === 'restaurants') {
          const favIds = await userService.getFavorites(user.uid);
          const fetched = await Promise.all(
            favIds.map(id => restaurantService.getRestaurantById(id))
          );
          setRestaurants(fetched.filter(r => r !== null) as Restaurant[]);
        } else {
          // Product favorites
          const favIds = await userService.getProductFavorites(user.uid);
          const fetched = await Promise.all(
            favIds.map(id => restaurantService.getProductById(id))
          );
          setProducts(fetched.filter(p => p !== null) as Product[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) loadFavorites();
      else router.push('/login');
    });
    return () => unsubscribe();
  }, [activeTab, router]);

  const toggleRestaurantFavorite = async (e: React.MouseEvent, restaurantId: string) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) return;
    setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    await userService.deleteFavorite(user.uid, restaurantId);
  };

  const toggleProductFavorite = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) return;
    setProducts(prev => prev.filter(p => p.id !== productId));
    await userService.deleteProductFavorite(user.uid, productId);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={24} color="var(--slate-900)" />
        </button>
        <h1 className={styles.title}>Mis Favoritos</h1>
      </header>

      <div className={styles.tabsRow}>
        <button 
          className={`${styles.tabItem} ${activeTab === 'products' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Productos
        </button>
        <button 
          className={`${styles.tabItem} ${activeTab === 'restaurants' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('restaurants')}
        >
          Restaurantes
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Cargando favoritos...</div>
        ) : activeTab === 'restaurants' ? (
          restaurants.length > 0 ? (
            <div className={styles.grid}>
              {restaurants.map(r => (
                <div key={r.id} className={styles.card} onClick={() => router.push(`/restaurant/${r.id}`)}>
                  <div className={styles.imgWrapper}>
                    <img src={r.image || 'https://via.placeholder.com/400'} alt={r.name} className={styles.cardImg} />
                    <button className={styles.likeBtn} onClick={(e) => toggleRestaurantFavorite(e, r.id!)}>
                      <Heart size={18} color="var(--primary)" fill="var(--primary)" />
                    </button>
                  </div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardName}>{r.name}</h3>
                    <p className={styles.cardCategory}>{r.category}</p>
                    <div className={styles.stats}>
                      <span className={styles.stat}><Star size={14} color="var(--primary)" /> {r.rating}</span>
                      <span className={styles.stat}><Clock size={14} color="var(--slate-500)" /> {r.deliveryTime} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>No tienes restaurantes favoritos.</div>
          )
        ) : (
          products.length > 0 ? (
            <div className={styles.grid}>
              {products.map(p => (
                <div key={p.id} className={styles.card} onClick={() => router.push(`/product/${p.id}`)}>
                  <div className={styles.imgWrapper}>
                    <img src={p.image || 'https://via.placeholder.com/400'} alt={p.name} className={styles.cardImg} />
                    <button className={styles.likeBtn} onClick={(e) => toggleProductFavorite(e, p.id!)}>
                      <Heart size={18} color="var(--primary)" fill="var(--primary)" />
                    </button>
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.titleRow}>
                      <h3 className={styles.cardName}>{p.name}</h3>
                      <span className={styles.price}>${p.price.toFixed(2)}</span>
                    </div>
                    <p className={styles.desc}>{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>No tienes productos favoritos.</div>
          )
        )}
      </div>
    </div>
  );
}
