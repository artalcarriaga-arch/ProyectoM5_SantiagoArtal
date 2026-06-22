// 1. Tipos de Usuario y Perfil
export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// 2. Tipo para el Catálogo de Productos
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

// 3. Tipo para los elementos del Carrito de compras
export interface CartItem {
  product: Product;
  quantity: number;
}

// 4. Estados posibles de una Orden de compra
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

// 5. Estructura de una Orden en Firestore
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}