import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product } from '../types';

const productsCollection = collection(db, 'products');

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