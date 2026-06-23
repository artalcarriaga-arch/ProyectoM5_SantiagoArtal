import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../src/hooks/useAuth';
import { AuthProvider } from '../src/context/AuthContext';
import React from 'react';
import * as firebaseAuth from 'firebase/auth';

vi.mock('firebase/auth');
vi.mock('firebase/firestore');
vi.mock('../src/config/firebase', () => ({
  auth: {},
  db: {},
}));

describe('useAuth', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe inicializar sin usuario', async () => {
    (firebaseAuth.onAuthStateChanged as any).mockImplementation((_: any, callback: any) => {
      callback(null);
      return vi.fn();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(AuthProvider, { children });
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });

  it('debe lanzar un error si se usa fuera del provider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth debe ser utilizado dentro de un AuthProvider');
  });

  it('debe retornar funciones de autenticación', async () => {
    (firebaseAuth.onAuthStateChanged as any).mockImplementation((_: any, callback: any) => {
      callback(null);
      return vi.fn();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(AuthProvider, { children });
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(typeof result.current.loginWithEmail).toBe('function');
      expect(typeof result.current.registerWithEmail).toBe('function');
      expect(typeof result.current.loginWithGoogle).toBe('function');
    });
  });

});
