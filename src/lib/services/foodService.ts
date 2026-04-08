import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const storage = getStorage();

export interface Food {
  id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
}

const FOODS_COLLECTION = "products";

// 🔥 Subir imagen
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const fileName = `foods/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const foodService = {
  async createFood(food: Food) {
    try {
      const docRef = await addDoc(collection(db, FOODS_COLLECTION), food);
      return docRef.id;
    } catch (error) {
      console.error("Error creating food:", error);
      throw error;
    }
  },

  async getFoods(): Promise<Food[]> {
    try {
      const snapshot = await getDocs(collection(db, FOODS_COLLECTION));

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Food[];
    } catch (error) {
      console.error("Error getting foods:", error);
      throw error;
    }
  },
};