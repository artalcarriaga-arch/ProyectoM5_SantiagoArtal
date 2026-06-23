import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

// Custom Hook para consumir el carrito de forma limpia y segura
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  return context;
};
