import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { deleteUser, User } from 'firebase/auth';
import { AddressItem } from '@/store/addressStore';
import { db } from '../firebase';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'Hombre' | 'Mujer' | 'Sin definir' | '35 tipo de Gey' | '';
}

const USERS_COLLECTION = 'users';

export const userService = {
  // Obtener datos del perfil de usuario
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching user profile ${userId}:`, error);
      throw error;
    }
  },

  // Guardar o actualizar el perfil de usuario
  async saveUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      // merge: true permite actualizar solo los campos proporcionados
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  },

  // Obtener todas las direcciones de un usuario
  async getAddresses(userId: string): Promise<AddressItem[]> {
    try {
      const colRef = collection(db, USERS_COLLECTION, userId, 'addresses');
      const querySnap = await getDocs(colRef);
      return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AddressItem));
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  },

  // Agregar una nueva dirección
  async addAddress(userId: string, address: AddressItem): Promise<string> {
    try {
      const colRef = collection(db, USERS_COLLECTION, userId, 'addresses');
      const docRef = await addDoc(colRef, address);
      return docRef.id;
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  },

  // Actualizar una dirección existente
  async updateAddress(userId: string, addressId: string, address: Partial<AddressItem>): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, 'addresses', addressId);
      await updateDoc(docRef, address);
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },

  // Eliminar una dirección
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, 'addresses', addressId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  },

  // --- FAVORITOS (ME GUSTAS) ---
  // Obtener los IDs de los restaurantes favoritos
  async getFavorites(userId: string): Promise<string[]> {
    try {
      const colRef = collection(db, USERS_COLLECTION, userId, 'favorites');
      const querySnap = await getDocs(colRef);
      return querySnap.docs.map(doc => doc.id);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  },

  // Agregar un favorito
  async addFavorite(userId: string, itemId: string): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, 'favorites', itemId);
      await setDoc(docRef, { timestamp: new Date() });
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  },

  // Eliminar un favorito
  async deleteFavorite(userId: string, itemId: string): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, 'favorites', itemId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting favorite:", error);
      throw error;
    }
  },

  // --- PRODUCTOS FAVORITOS ---
  async getProductFavorites(userId: string): Promise<string[]> {
    try {
      const colRef = collection(db, USERS_COLLECTION, userId, 'productFavorites');
      const querySnap = await getDocs(colRef);
      return querySnap.docs.map(doc => doc.id);
    } catch (error) {
      console.error("Error fetching product favorites:", error);
      throw error;
    }
  },

  async addProductFavorite(userId: string, itemId: string): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, 'productFavorites', itemId);
      await setDoc(docRef, { favoritedAt: new Date() });
    } catch (error) {
      console.error("Error adding product favorite:", error);
      throw error;
    }
  },

  async deleteProductFavorite(userId: string, itemId: string): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, 'productFavorites', itemId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting product favorite:", error);
      throw error;
    }
  },


  // Eliminar la cuenta de usuario de Firestore y Firebase Auth
  async deleteUserAccount(user: User): Promise<void> {
    try {
      const userId = user.uid;
      const docRef = doc(db, USERS_COLLECTION, userId);
      await deleteDoc(docRef);
      await deleteUser(user);
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw error;
    }
  }
};
