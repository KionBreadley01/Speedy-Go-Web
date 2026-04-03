import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface Food {
  id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
}

const FOODS_COLLECTION = 'products'; // 👈 puedes usar "products" como ya tienes

export const foodService = {
  async createFood(food: Food) {
    try {
      const docRef = await addDoc(collection(db, FOODS_COLLECTION), food);
      return docRef.id;
    } catch (error) {
      console.error("Error creating food:", error);
      throw error;
    }
  }
};