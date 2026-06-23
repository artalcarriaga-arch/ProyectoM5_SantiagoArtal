import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
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

const productsCollection = collection(db, 'products');

export const getProductsFromDB = async (category?: string): Promise<Product[]> => {
  const q = category && category !== 'Todos'
    ? query(productsCollection, where('category', '==', category))
    : productsCollection;

  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Product[];
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error("Error obteniendo productos de Firestore:", error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<boolean> => {
  try {
    await addDoc(productsCollection, product);
    return true;
  } catch (error) {
    console.error("Error al crear el producto en Firestore:", error);
    return false;
  }
};