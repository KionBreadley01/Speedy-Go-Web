"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { restaurantService, Restaurant } from '@/lib/services/restaurantService';
import { Product, useCartStore } from '@/store/cartStore';
import { useAddressStore } from '@/store/addressStore';
import { auth } from '@/lib/firebase';
import { userService } from '@/lib/services/userService';
import { Heart, Clock, Star, Zap } from 'lucide-react';
import { useToast } from '@/components/Toast';
import styles from './page.module.css';

const CATEGORIES = [
  { label: 'Pizza',        image: '/categories/pizza.png' },
  { label: 'Hamburguesas', image: '/categories/burger.png' },
  { label: 'Tacos',        image: '/categories/tacos.png' },
  { label: 'Sushi',        image: '/categories/sushi.png' },
  { label: 'Saludable',    image: '/categories/healthy.png' },
  { label: 'Súper',        image: '/categories/super.png' },
];

export default function Home() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const cartTotalItems = useCartStore((state) => state.getTotalItems());
  const cartTotalPrice = useCartStore((state) => state.getTotalPrice());
  const { setAddresses } = useAddressStore();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const data = await userService.getAddresses(user.uid);
            setAddresses(data);
            const favs = await userService.getFavorites(user.uid);
            setFavorites(favs);
          } catch (e) {
            console.error(e);
          }
        }
      });
    };
    loadUserData();
  }, [setAddresses]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rests, prods] = await Promise.all([
          restaurantService.getRestaurants(),
          restaurantService.getProducts()
        ]);
        setRestaurants(rests);
        setProducts(prods);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, restaurantId: string) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) {
      showToast('Inicia sesión para guardar favoritos', 'warning');
      return;
    }

    const isFav = favorites.includes(restaurantId);
    if (isFav) {
      setFavorites(prev => prev.filter(id => id !== restaurantId));
      try {
        await userService.deleteFavorite(user.uid, restaurantId);
      } catch (e) {
        setFavorites(prev => [...prev, restaurantId]);
      }
    } else {
      setFavorites(prev => [...prev, restaurantId]);
      try {
        await userService.addFavorite(user.uid, restaurantId);
      } catch (e) {
        setFavorites(prev => prev.filter(id => id !== restaurantId));
      }
    }
  };

  const filteredRestaurants = selectedCategory 
    ? restaurants.filter(r => r.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    : restaurants;

  const filteredProducts = selectedCategory
    ? products.filter(p => {
         const rest = restaurants.find(r => r.id === p.restaurantId);
         if (rest?.category.toLowerCase().includes(selectedCategory.toLowerCase())) return true;
         if (p.name.toLowerCase().includes(selectedCategory.toLowerCase())) return true;
         return false;
      })
    : [];

  return (
    <div className={styles.container}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Tu comida favorita, <br/><span className={styles.heroHighlight}>a la velocidad de Speedy-Go</span></h1>
          <p className={styles.heroSubtitle}>Descubre los mejores restaurantes y platos cerca de ti.</p>
        </div>
      </div>

      {/* Categories Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Categorías</h2>
          <span className={styles.seeAll}>Ver todo</span>
        </div>
        <div className={styles.horizontalScroll}>
          {CATEGORIES.map((cat, i) => {
            const isActive = selectedCategory?.toLowerCase() === cat.label.toLowerCase();
            return (
              <button
                key={i}
                className={styles.categoryItem}
                onClick={() => setSelectedCategory(isActive ? null : cat.label)}
              >
                <div className={`${styles.categoryCircle} ${isActive ? styles.categoryActive : ''}`}>
                  <Image src={cat.image} alt={cat.label} width={48} height={48} />
                </div>
                <span className={`${styles.categoryLabel} ${isActive ? styles.categoryLabelActive : ''}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Category Products */}
      {selectedCategory && filteredProducts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Productos en {selectedCategory}</h2>
          </div>
          <div className={styles.horizontalScroll}>
            {filteredProducts.map((p, i) => (
              <div key={i} className={styles.productCard} onClick={() => router.push(`/product/${p.id}`)}>
                <div className={styles.productImgWrapper}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} className={styles.productImg} />
                  ) : (
                    <div className={styles.productPlaceholder} />
                  )}
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{p.name}</h3>
                  <span className={styles.productPrice}>${p.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Restaurants Section */}
      <section className={`${styles.section} ${styles.bottomPadding}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleRow}>
            <div className={styles.boltBadge}>
              <Zap size={14} color="var(--white)" fill="var(--white)" />
            </div>
            <h2 className={styles.sectionTitle}>Rápido cerca de ti</h2>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Cargando restaurantes...</div>
        ) : filteredRestaurants.length > 0 ? (
          <div className={styles.restaurantsGrid}>
            {filteredRestaurants.map((r, i) => (
              <div key={r.id || i} className={styles.restaurantCard} onClick={() => router.push(`/restaurant/${r.id}`)}>
                <div className={styles.restaurantImgWrapper}>
                  {r.image ? (
                    <img src={r.image} alt={r.name} className={styles.restaurantImg} />
                  ) : (
                    <div className={styles.restaurantPlaceholder} />
                  )}
                  
                  <button className={styles.likeBtn} onClick={(e) => toggleFavorite(e, r.id)}>
                    <Heart 
                      size={20} 
                      color={favorites.includes(r.id) ? "var(--primary)" : "var(--white)"}
                      fill={favorites.includes(r.id) ? "var(--primary)" : "transparent"}
                    />
                  </button>

                  <div className={styles.timeBadge}>
                    <span className={styles.timeDot}>●</span>
                    <span className={styles.timeText}>{r.deliveryTime || '20-30 min'}</span>
                  </div>
                </div>
                
                <div className={styles.restaurantInfo}>
                  <div className={styles.restaurantInfoRow}>
                    <div className={styles.restaurantTextData}>
                      <h3 className={styles.restaurantName}>{r.name}</h3>
                      <p className={styles.restaurantCategory}>{r.category}</p>
                    </div>
                    <div className={styles.ratingBadge}>
                      <span className={styles.ratingText}>{r.rating || '4.5'}</span>
                      <Star size={12} color="var(--success)" fill="var(--success)" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noData}>No hay restaurantes disponibles.</div>
        )}
      </section>

      {/* Floating Cart (Mobile mostly, but works well on web too) */}
      {mounted && cartTotalItems > 0 && (
        <div className={styles.cartFloatingWrap}>
          <button className={styles.cartFloatingBar} onClick={() => router.push('/cart')}>
            <span className={styles.cartCount}>{cartTotalItems} items</span>
            <span className={styles.cartLabel}>Ver Carrito</span>
            <span className={styles.cartTotal}>${cartTotalPrice.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
