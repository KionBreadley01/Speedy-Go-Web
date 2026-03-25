"use client"

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, Product } from '@/store/cartStore';
import { Restaurant, restaurantService } from '@/lib/services/restaurantService';
import { Minus, Plus, ShoppingBag, ArrowLeft, Star, Clock, Heart, ShoppingCart } from 'lucide-react';
import { userService } from '@/lib/services/userService';
import { auth } from '@/lib/firebase';
import { useToast } from '@/components/Toast';
import styles from './restaurant.module.css';

export default function RestaurantDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { addItem } = useCartStore();
  const { showToast } = useToast();

  // Unpack params logic correctly for Next 14+ / use hook if needed
  const { id } = use(params);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rest, prods] = await Promise.all([
          restaurantService.getRestaurantById(id),
          restaurantService.getProductsByRestaurant(id)
        ]);
        setRestaurant(rest);
        setProducts(prods);

        // Load favorites if user is authenticated
        const user = auth.currentUser;
        if (user) {
          const favs = await userService.getProductFavorites(user.uid);
          setFavorites(favs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  const toggleFavorite = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) {
      showToast('Inicia sesión para guardar favoritos', 'info');
      return;
    }

    const isFav = favorites.includes(productId);
    try {
      if (isFav) {
        await userService.deleteProductFavorite(user.uid, productId);
        setFavorites(favorites.filter(id => id !== productId));
      } else {
        await userService.addProductFavorite(user.uid, productId);
        setFavorites([...favorites, productId]);
      }
    } catch {
      showToast('Error al actualizar favoritos', 'error');
    }
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    showToast(`${product.name} añadido al carrito`, 'success');
  };

  if (loading) return <div className={styles.loading}>Cargando restaurante...</div>;
  if (!restaurant) return <div className={styles.loading}>Restaurante no encontrado.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.heroImgWrapper}>
        <img src={restaurant.image || 'https://via.placeholder.com/800x400'} alt={restaurant.name} className={styles.heroImg} />
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={24} color="var(--slate-900)" />
        </button>
      </div>

      <div className={styles.headerInfo}>
        <h1 className={styles.title}>{restaurant.name}</h1>
        <p className={styles.category}>{restaurant.category} • {restaurant.rating} ★</p>

        <div className={styles.statsRow}>
          <div className={styles.statBadge}>
            <Star size={16} color="var(--primary)" />
            <span>{restaurant.rating} Excelente</span>
          </div>
          <div className={styles.statBadge}>
            <Clock size={16} color="var(--primary)" />
            <span>{restaurant.deliveryTime} min</span>
          </div>
        </div>
      </div>

      <div className={styles.menuSection}>
        <h2 className={styles.menuTitle}>Menú</h2>
        <div className={styles.productsGrid}>
          {products.map(product => (
            <div 
              key={product.id} 
              className={styles.productCard}
              onClick={() => router.push(`/product/${product.id}`)}
            >
              <div className={styles.productInfo}>
                <div className={styles.productNameRow}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <button 
                    className={styles.heartBtn} 
                    onClick={(e) => toggleFavorite(product.id, e)}
                    type="button"
                  >
                    <Heart size={20} color={favorites.includes(product.id) ? "#ef4444" : "var(--slate-400)"} fill={favorites.includes(product.id) ? "#ef4444" : "none"} />
                  </button>
                </div>
                <p className={styles.productDesc}>{product.description}</p>
                <div className={styles.priceRow}>
                  <span className={styles.productPrice}>${product.price.toFixed(2)}</span>
                  <button 
                    className={styles.quickAddBtn} 
                    onClick={(e) => handleQuickAdd(product, e)}
                    type="button"
                  >
                    <ShoppingCart size={18} color="var(--white)" />
                  </button>
                </div>
              </div>
              <div className={styles.productImgWrapper}>
                <img src={product.image || 'https://via.placeholder.com/120'} alt={product.name} className={styles.productImg} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
