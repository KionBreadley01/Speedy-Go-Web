import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc
} from 'firebase/firestore';

import { deleteUser, User } from 'firebase/auth';
import { AddressItem } from '@/store/addressStore';
import { db } from '../firebase';

// ✅ ROLES CORREGIDOS
export type UserRole = 'user' | 'restaurant_owner';

// ✅ INTERFAZ COMPLETA Y ESCALABLE
export interface UserProfile {
  email: string;
  phone: string;

  role: UserRole;

  // 👤 Usuario normal
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: 'Hombre' | 'Mujer' | 'Sin definir' | '';

  // 🍽️ Restaurante
  restaurantId?: string; // 🔥 CLAVE PARA RELACIÓN
  restaurantName?: string;
  ownerName?: string;
  address?: string;
  cuisineType?: string;

  createdAt?: string;
}

const USERS_COLLECTION = 'users';

export const userService = {
  // ✅ Obtener perfil
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

  // ✅ Guardar / actualizar perfil
  async saveUserProfile(
    userId: string,
    data: Partial<UserProfile>
  ): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);

      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  },

  // =========================
  // 📍 DIRECCIONES
  // =========================

  async getAddresses(userId: string): Promise<AddressItem[]> {
    try {
      const colRef = collection(db, USERS_COLLECTION, userId, 'addresses');
      const querySnap = await getDocs(colRef);

      return querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AddressItem));
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  },

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

  async updateAddress(
    userId: string,
    addressId: string,
    address: Partial<AddressItem>
  ): Promise<void> {
    try {
      const docRef = doc(
        db,
        USERS_COLLECTION,
        userId,
        'addresses',
        addressId
      );

      await updateDoc(docRef, address);
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      const docRef = doc(
        db,
        USERS_COLLECTION,
        userId,
        'addresses',
        addressId
      );

      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  },

  // =========================
  // ❤️ FAVORITOS (RESTAURANTES)
  // =========================

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

  async addFavorite(userId: string, itemId: string): Promise<void> {
    try {
      const docRef = doc(
        db,
        USERS_COLLECTION,
        userId,
        'favorites',
        itemId
      );

      await setDoc(docRef, { timestamp: new Date() });
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  },

  async deleteFavorite(userId: string, itemId: string): Promise<void> {
    try {
      const docRef = doc(
        db,
        USERS_COLLECTION,
        userId,
        'favorites',
        itemId
      );

      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting favorite:", error);
      throw error;
    }
  },

  // =========================
  // 🍔 PRODUCTOS FAVORITOS
  // =========================

  async getProductFavorites(userId: string): Promise<string[]> {
    try {
      const colRef = collection(
        db,
        USERS_COLLECTION,
        userId,
        'productFavorites'
      );

      const querySnap = await getDocs(colRef);

      return querySnap.docs.map(doc => doc.id);
    } catch (error) {
      console.error("Error fetching product favorites:", error);
      throw error;
    }
  },

  async addProductFavorite(userId: string, itemId: string): Promise<void> {
    try {
      const docRef = doc(
        db,
        USERS_COLLECTION,
        userId,
        'productFavorites',
        itemId
      );

      await setDoc(docRef, { favoritedAt: new Date() });
    } catch (error) {
      console.error("Error adding product favorite:", error);
      throw error;
    }
  },

  async deleteProductFavorite(userId: string, itemId: string): Promise<void> {
    try {
      const docRef = doc(
        db,
        USERS_COLLECTION,
        userId,
        'productFavorites',
        itemId
      );

      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting product favorite:", error);
      throw error;
    }
  },

  // =========================
  // ❌ ELIMINAR CUENTA
  // =========================

  async deleteUserAccount(user: User): Promise<void> {
    try {
      const userId = user.uid;

      // 🔥 eliminar perfil
      await deleteDoc(doc(db, USERS_COLLECTION, userId));

      // 🔐 eliminar auth
      await deleteUser(user);
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw error;
    }
  }
};