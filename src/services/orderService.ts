import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendOrderCreatedEmail, sendOrderStatusEmail } from './emailService';

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
  customerName: string,
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
  const orderId = docRef.id;

  try {
    await sendOrderCreatedEmail(
      customerEmail,
      customerName,
      orderId,
      total,
      items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }))
    );
  } catch (error) {
    console.error('Error al enviar email de confirmación:', error);
  }

  return orderId;
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

export const updateOrderStatus = async (
  orderId: string,
  newStatus: 'pending' | 'processing' | 'completed' | 'cancelled'
): Promise<void> => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { status: newStatus });
};

export const updateOrderStatusWithEmail = async (
  orderId: string,
  newStatus: 'pending' | 'processing' | 'completed' | 'cancelled',
  customerEmail: string,
  customerName: string
): Promise<void> => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { status: newStatus });

  try {
    await sendOrderStatusEmail(customerEmail, customerName, orderId, newStatus);
  } catch (error) {
    console.error('Error al enviar email de actualización de estado:', error);
  }
};
