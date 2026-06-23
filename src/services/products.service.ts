import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

export const getProductsFromDB = async (category?: string): Promise<Product[]> => {
  const productsRef = collection(db, 'products');
  
  // Si nos pasan categoría, armamos una Query con filtro de Firestore, sino traemos todo
  const q = category && category !== 'Todos'
    ? query(productsRef, where('category', '==', category))
    : productsRef;

  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Product[];
};