import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

// Definimos la estructura de un ítem dentro de la orden
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

// Estructura completa de la Orden para Firestore
export interface Order {
  id?: string;
  userId: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: any;
}

// Función para guardar una nueva orden en Firestore
export const createOrderInDB = async (
  userId: string, 
  customerEmail: string, 
  items: OrderItem[], 
  total: number
): Promise<string> => {
  const ordersRef = collection(db, 'orders');

  const newOrder: Omit<Order, 'id'> = {
    userId,
    customerEmail,
    items,
    total,
    status: 'pending', // Toda orden arranca en pendiente
    createdAt: serverTimestamp() // Setea la hora del servidor de Google automáticamente
  };

  const docRef = await addDoc(ordersRef, newOrder);
  return docRef.id; // Retornamos el ID de la orden generada
};

// Función para que el cliente vea su historial de compras pasadas
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Order[];
};
