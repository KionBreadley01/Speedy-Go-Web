import { addDoc, collection, doc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { CartItem } from '../../store/cartStore';

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

export interface Order {
  id?: string;
  userId: string;
  restaurantId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryAddress: string;
  status: OrderStatus;
  createdAt: any;
  updatedAt: any;
}

const ORDERS_COLLECTION = 'orders';

export const orderService = {
  // Crear un nuevo pedido
  async placeOrder(
    userId: string, 
    restaurantId: string, 
    items: CartItem[], 
    totalAmount: number, 
    deliveryAddress: string
  ): Promise<string> {
    try {
      const orderData = {
        userId,
        restaurantId,
        items,
        totalAmount,
        deliveryAddress,
        status: 'pending' as OrderStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
      return docRef.id;
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  },

  // Obtener todos los pedidos de un usuario específico
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION), 
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      
      // Ordenar en memoria por createdAt desc
      orders.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      
      return orders;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },

  // Cancelar un pedido
  async cancelOrder(orderId: string): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  },

  // Escuchar actualizaciones del estado del pedido en tiempo real
  subscribeToOrderStatus(orderId: string, callback: (status: OrderStatus) => void): () => void {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    return onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.status as OrderStatus);
      }
    });
  },

  // Escuchar explícitamente el documento completo del pedido
  subscribeToOrder(orderId: string, callback: (order: Order | null) => void): () => void {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    return onSnapshot(orderRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback({ id: docSnapshot.id, ...docSnapshot.data() } as Order);
      } else {
        callback(null);
      }
    });
  }
};
