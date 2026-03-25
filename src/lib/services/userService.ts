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
  // Get user profile data
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

  // Save or Update user profile
  async saveUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      // Merge true allows updating only the provided fields
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  },

  // Get all addresses for a user
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

  // Add a new address
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

  // Update an existing address
  async updateAddress(userId: string, addressId: string, address: Partial<AddressItem>): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, 'addresses', addressId);
      await updateDoc(docRef, address);
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },

  // Delete an address
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, 'addresses', addressId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  },

  // --- FAVORITES (ME GUSTAS) ---
  // Get favorite restaurant IDs
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

  // Add a favorite
  async addFavorite(userId: string, itemId: string): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, 'favorites', itemId);
      await setDoc(docRef, { timestamp: new Date() });
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  },

  // Delete a favorite
  async deleteFavorite(userId: string, itemId: string): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, 'favorites', itemId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting favorite:", error);
      throw error;
    }
  },

  // --- PRODUCT FAVORITES ---
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


  // Delete user account from Firestore and Firebase Auth
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
