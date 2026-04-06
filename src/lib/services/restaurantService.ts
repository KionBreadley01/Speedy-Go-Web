import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../../store/cartStore';

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  ownerId: string;
  createdAt: string;
}

const RESTAURANTS_COLLECTION = 'restaurants';
const PRODUCTS_COLLECTION = 'products';

export const restaurantService = {

  // ✅ Crear restaurante
  async createRestaurant(data: Omit<Restaurant, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, RESTAURANTS_COLLECTION), data);
      return docRef.id;
    } catch (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }
  },

  // ✅ Obtener todos los restaurantes
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const q = query(collection(db, RESTAURANTS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      const restaurants: Restaurant[] = [];
      querySnapshot.forEach((docSnap) => {
        restaurants.push({ id: docSnap.id, ...docSnap.data() } as Restaurant);
      });
      
      return restaurants;
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      throw error;
    }
  },

  // ✅ Obtener restaurante por ID
  async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const docRef = doc(db, RESTAURANTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Restaurant;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching restaurant ${id}:`, error);
      throw error;
    }
  },

  // ✅ Obtener todos los productos
  async getProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });

      return products;
    } catch (error) {
      console.error("Error fetching all products:", error);
      throw error;
    }
  },

  // ✅ Productos por restaurante
  async getProductsByRestaurant(restaurantId: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION), 
        where("restaurantId", "==", restaurantId)
      );

      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      
      return products;
    } catch (error) {
      console.error(`Error fetching products for restaurant ${restaurantId}:`, error);
      throw error;
    }
  },

  // ✅ Producto por ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }
};