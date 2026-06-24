import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getImageUrl } from './s3.service';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  imageFileKey?: string;
  stock: number;
}

const productsCollection = collection(db, 'products');

const refreshImageUrl = async (product: any): Promise<Product> => {
  try {
    const fileKey = product.imageFileKey || product.imageUrl?.split('.com/')[1];
    if (fileKey) {
      const newImageUrl = await getImageUrl(fileKey);
      return {
        id: product.id,
        ...product,
        imageUrl: newImageUrl,
        imageFileKey: fileKey
      };
    }
  } catch (error) {
    console.warn('Error refrescando URL de imagen:', error);
  }
  
  return {
    id: product.id,
    ...product
  };
};

export const getProductsFromDB = async (category?: string): Promise<Product[]> => {
  const q = category && category !== 'Todos'
    ? query(productsCollection, where('category', '==', category))
    : productsCollection;

  const querySnapshot = await getDocs(q);
  
  const products = await Promise.all(
    querySnapshot.docs.map(doc => refreshImageUrl({ id: doc.id, ...doc.data() }))
  );
  
  return products;
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(productsCollection);
    const products = await Promise.all(
      snapshot.docs.map(doc => refreshImageUrl({ id: doc.id, ...doc.data() }))
    );
    return products;
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

export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id'>>): Promise<boolean> => {
  try {
    const productDoc = doc(db, 'products', id);
    await updateDoc(productDoc, updates);
    return true;
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    return false;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const productDoc = doc(db, 'products', id);
    await deleteDoc(productDoc);
    return true;
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return false;
  }
};