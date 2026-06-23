import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'customer')[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Mientras Firebase resuelve la sesión y se carga el rol desde Firestore,
  // mostramos un spinner. Esto evita el "parpadeo" y redirects prematuros.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Si no inició sesión, lo mandamos al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta exige un rol específico y el usuario no lo tiene, lo pateamos a la tienda
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  // Si pasa todos los filtros, Outlet renderiza la página interna de forma segura
  return <Outlet />;
}