"use client"

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Restaurant, restaurantService } from '@/lib/services/restaurantService';
import { Search as SearchIcon, Star, Clock } from 'lucide-react';
import styles from './search.module.css';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const router = useRouter();
  
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const all = await restaurantService.getRestaurants();
        const lowerQuery = query.toLowerCase();
        const filtered = all.filter((r: Restaurant) => 
          r.name.toLowerCase().includes(lowerQuery) || 
          r.category.toLowerCase().includes(lowerQuery)
        );
        setResults(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (query) {
      fetchResults();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {query ? `Resultados para "${query}"` : 'Busca tu comida favorita'}
      </h1>

      {loading ? (
        <div className={styles.loading}>Buscando...</div>
      ) : results.length === 0 && query ? (
        <div className={styles.emptyState}>
          <SearchIcon size={48} color="var(--gray-300)" />
          <p>No encontramos restaurantes que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {results.map(restaurant => (
            <div 
              key={restaurant.id} 
              className={styles.card}
              onClick={() => router.push(`/restaurant/${restaurant.id}`)}
            >
              <div className={styles.imgWrapper}>
                <img src={restaurant.image || 'https://via.placeholder.com/400'} alt={restaurant.name} className={styles.img} />
              </div>
              <div className={styles.info}>
                <h3 className={styles.name}>{restaurant.name}</h3>
                <p className={styles.category}>{restaurant.category}</p>
                <div className={styles.stats}>
                  <div className={styles.statLine}>
                    <Star size={14} color="var(--primary)" />
                    <span>{restaurant.rating}</span>
                  </div>
                  <div className={styles.statLine}>
                    <Clock size={14} color="var(--slate-500)" />
                    <span className={styles.time}>{restaurant.deliveryTime} min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Search() {
  return (
    <Suspense fallback={<div className={styles.loading}>Cargando...</div>}>
      <SearchContent />
    </Suspense>
  );
}
