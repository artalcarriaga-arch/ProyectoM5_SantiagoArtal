import React, { createContext, useContext, useReducer } from 'react';
import { CartItem, Product } from '../types';

// 1. Definimos el estado del carrito
interface CartState {
  items: CartItem[];
  total: number;
}

// 2. Definimos las acciones posibles que alteran el carrito
type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string } // Recibe el productId
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  total: 0,
};

// Función auxiliar para calcular el total acumulado
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
};

// 3. El Reducer: la función pura que maneja la lógica de estado
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingIndex = state.items.findIndex(item => item.product.id === action.payload.id);
      let updatedItems = [...state.items];

      if (existingIndex > -1) {
        // Si ya existe el producto, incrementamos su cantidad
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1,
        };
      } else {
        // Si es nuevo, lo agregamos al arreglo
        updatedItems.push({ product: action.payload, quantity: 1 });
      }

      return { items: updatedItems, total: calculateTotal(updatedItems) };
    }

    case 'REMOVE_FROM_CART': {
      const updatedItems = state.items.filter(item => item.product.id !== action.payload);
      return { items: updatedItems, total: calculateTotal(updatedItems) };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items
        .map(item =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter(item => item.quantity > 0); // Si la cantidad baja a 0, se remueve automáticamente

      return { items: updatedItems, total: calculateTotal(updatedItems) };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
};

// 4. Crear el Contexto
interface CartContextType extends CartState {
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// 5. Componente Proveedor (Provider)
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Funciones despachadoras de acciones (helpers para los componentes)
  const addToCart = (product: Product) => dispatch({ type: 'ADD_TO_CART', payload: product });
  const removeFromCart = (productId: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  const updateQuantity = (productId: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ ...state, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// 6. Custom Hook para consumir el carrito de forma limpia
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  return context;
};