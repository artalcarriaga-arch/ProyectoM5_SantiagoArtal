import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { CartProvider } from '../src/context/CartContext';
import { useCart } from '../src/hooks/useCart';
import { Product } from '../src/types';

vi.mock('../src/config/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('../src/services/orderService', () => ({
  createOrderInDB: vi.fn().mockResolvedValue('order-123'),
}));

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Remera Nike PRO',
  description: 'Ideal para entrenamiento',
  price: 30000,
  category: 'Remeras',
  imageUrl: 'https://example.com/remera.jpg',
  stock: 9,
};

const mockProduct2: Product = {
  id: 'prod-2',
  name: 'Zapatillas Adidas',
  description: 'Cómodas para correr',
  price: 85000,
  category: 'Zapatillas',
  imageUrl: 'https://example.com/zapatillas.jpg',
  stock: 3,
};

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(CartProvider, { children });

describe('Flujo de integración: carrito → checkout', () => {

  it('flujo completo: agregar, actualizar, confirmar y limpiar carrito', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(30000);

    act(() => {
      result.current.addToCart(mockProduct2);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.total).toBe(115000);

    act(() => {
      result.current.updateQuantity('prod-1', 2);
    });

    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.total).toBe(145000);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('debe calcular el total correctamente con múltiples cantidades', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.total).toBe(90000);
  });

  it('debe remover un producto sin afectar el resto del carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct2);
    });

    act(() => {
      result.current.removeFromCart('prod-1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod-2');
    expect(result.current.total).toBe(85000);
  });

  it('debe poner cantidad en 0 y eliminar el producto del carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.updateQuantity('prod-1', 0);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('el carrito permanece vacío tras limpiar y puede recibir nuevos productos', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);

    act(() => {
      result.current.addToCart(mockProduct2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod-2');
    expect(result.current.total).toBe(85000);
  });

});
