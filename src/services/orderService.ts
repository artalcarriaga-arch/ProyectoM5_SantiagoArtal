import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id?: string;
  userId: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: any;
}

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
    status: 'pending',
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(ordersRef, newOrder);
  return docRef.id;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Order[];
};
