import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile } from '../types';

// 1. Definimos qué datos va a exponer este contexto a toda la app
interface AuthContextType {
  user: FirebaseUser | null;       // Datos duros de Firebase (uid, email)
  profile: UserProfile | null;     // Datos de nuestra DB (rol, fecha de creación)
  loading: boolean;                // Esperando a que Firebase nos diga si hay sesión
  isLoadingRole: boolean;          // Esperando a traer el rol desde Firestore
}

// Creamos el contexto propiamente dicho
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Componente Proveedor que envolverá a toda la aplicación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingRole, setIsLoadingRole] = useState(false);

  useEffect(() => {
    // onAuthStateChanged escucha en tiempo real si el usuario inicia o cierra sesión
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);

      if (firebaseUser) {
        setIsLoadingRole(true);
        try {
          // Buscamos el documento del usuario en la colección 'users' de Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // Si ya existe en la base de datos, guardamos su perfil (con su rol)
            setProfile(userDoc.data() as UserProfile);
          } else {
            // Si se loguea por primera vez (ej: con Google), no va a tener documento.
            // Lo creamos automáticamente asignándole el rol de 'customer' por defecto.
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: 'customer', 
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error al obtener el rol del usuario desde Firestore:", error);
        } finally {
          setIsLoadingRole(false);
        }
      } else {
        // Si no hay firebaseUser, significa que no está logueado o cerró sesión
        setProfile(null);
      }
      setLoading(false);
    });

    // Nos desasociamos del listener cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isLoadingRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom Hook para consumir la autenticación de forma súper simple
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  return context;
};