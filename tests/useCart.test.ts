import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../src/hooks/useCart';
import { CartProvider } from '../src/context/CartContext';
import { Product } from '../src/types';
import React from 'react';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  category: 'Remeras',
  imageUrl: 'https://example.com/image.jpg',
  stock: 10,
};

describe('useCart', () => {
  
  it('debe inicializar con carrito vacío', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(CartProvider, { children });
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('debe agregar un producto al carrito', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(CartProvider, { children });
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockProduct);
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('1');
    expect(result.current.total).toBe(100);
  });

  it('debe remover un producto del carrito', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(CartProvider, { children });
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockProduct);
    });
    
    act(() => {
      result.current.removeFromCart('1');
    });
    
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('debe actualizar la cantidad de un producto', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(CartProvider, { children });
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockProduct);
    });
    
    act(() => {
      result.current.updateQuantity('1', 5);
    });
    
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.total).toBe(500);
  });

  it('debe limpiar el carrito completamente', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(CartProvider, { children });
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockProduct);
    });
    
    act(() => {
      result.current.clearCart();
    });
    
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('debe lanzar un error si se usa fuera del provider', () => {
    expect(() => {
      renderHook(() => useCart());
    }).toThrow('useCart debe ser utilizado dentro de un CartProvider');
  });

});
