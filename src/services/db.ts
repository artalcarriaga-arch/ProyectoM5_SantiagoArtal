import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product } from '../types';

// Referencia a la colección 'products' en Firestore
const productsCollection = collection(db, 'products');

export const getProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(productsCollection);
    // Mapeamos los documentos de Firebase al formato de nuestro tipo Product
    const productsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    
    return productsList;
  } catch (error) {
    console.error("Error obteniendo productos de Firestore:", error);
    return []; // En caso de error, devolvemos un array vacío para no romper la UI
  }
};