import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  restaurantId: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (product, quantity = 1) => {
        set((state) => {
          let newItems = [...state.items];
          let newRestaurantId = state.restaurantId;

          if (state.restaurantId && state.restaurantId !== product.restaurantId) {
            newItems = [];
          }
          
          newRestaurantId = product.restaurantId;

          const existingItem = newItems.find((item) => item.id === product.id);

          if (existingItem) {
            newItems = newItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems.push({ ...product, quantity });
          }

          return { items: newItems, restaurantId: newRestaurantId };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== productId);
          return {
            items: newItems,
            restaurantId: newItems.length === 0 ? null : state.restaurantId,
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((item) => item.id !== productId);
            return {
              items: newItems,
              restaurantId: newItems.length === 0 ? null : state.restaurantId,
            };
          }
          return {
            items: state.items.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [], restaurantId: null });
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'speedy-go-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
