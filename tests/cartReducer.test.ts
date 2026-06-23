import { describe, it, expect } from 'vitest';
import { cartReducer, initialState } from '../../src/context/CartContext';
import { Product } from '../../src/types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  category: 'Remeras',
  imageUrl: 'https://example.com/image.jpg',
  stock: 10,
};

const mockProduct2: Product = {
  id: '2',
  name: 'Test Product 2',
  description: 'Test Description 2',
  price: 50,
  category: 'Pantalones',
  imageUrl: 'https://example.com/image2.jpg',
  stock: 5,
};

describe('cartReducer', () => {
  
  describe('ADD_TO_CART', () => {
    it('debe agregar un producto al carrito vacío', () => {
      const state = initialState;
      const action = { type: 'ADD_TO_CART' as const, payload: mockProduct };
      
      const result = cartReducer(state, action);
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].product.id).toBe('1');
      expect(result.items[0].quantity).toBe(1);
      expect(result.total).toBe(100);
    });

    it('debe incrementar la cantidad si el producto ya existe', () => {
      let state = initialState;
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct });
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct });
      
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
      expect(state.total).toBe(200);
    });

    it('debe agregar múltiples productos diferentes', () => {
      let state = initialState;
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct });
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct2 });
      
      expect(state.items).toHaveLength(2);
      expect(state.total).toBe(150);
    });
  });

  describe('REMOVE_FROM_CART', () => {
    it('debe remover un producto del carrito', () => {
      let state = initialState;
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct });
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct2 });
      
      state = cartReducer(state, { type: 'REMOVE_FROM_CART', payload: '1' });
      
      expect(state.items).toHaveLength(1);
      expect(state.items[0].product.id).toBe('2');
      expect(state.total).toBe(50);
    });

    it('debe actualizar el total correctamente', () => {
      let state = initialState;
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct });
      state = cartReducer(state, { type: 'REMOVE_FROM_CART', payload: '1' });
      
      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });
  });

  describe('UPDATE_QUANTITY', () => {
    it('debe actualizar la cantidad de un producto', () => {
      let state = initialState;
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct });
      state = cartReducer(state, { type: 'UPDATE_QUANTITY', payload: { productId: '1', quantity: 5 } });
      
      expect(state.items[0].quantity).toBe(5);
      expect(state.total).toBe(500);
    });

    it('debe remover un producto si la cantidad es 0', () => {
      let state = initialState;
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct });
      state = cartReducer(state, { type: 'UPDATE_QUANTITY', payload: { productId: '1', quantity: 0 } });
      
      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });

    it('debe mantener otros productos intactos', () => {
      let state = initialState;
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct });
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct2 });
      state = cartReducer(state, { type: 'UPDATE_QUANTITY', payload: { productId: '1', quantity: 3 } });
      
      expect(state.items).toHaveLength(2);
      expect(state.items[0].quantity).toBe(3);
      expect(state.items[1].quantity).toBe(1);
      expect(state.total).toBe(350);
    });
  });

  describe('CLEAR_CART', () => {
    it('debe vaciar el carrito completamente', () => {
      let state = initialState;
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct });
      state = cartReducer(state, { type: 'ADD_TO_CART', payload: mockProduct2 });
      
      state = cartReducer(state, { type: 'CLEAR_CART' });
      
      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });
  });

});
