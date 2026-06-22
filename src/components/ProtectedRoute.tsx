import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'customer')[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading, isLoadingRole } = useAuth();

  // 1. Mientras Firebase comprueba la sesión o Firestore busca el rol, mostramos un spinner.
  // Esto evita el "parpadeo" donde se ve la pantalla de admin por un milisegundo.
  if (loading || isLoadingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 2. Si ni siquiera inició sesión, lo mandamos directo al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si la ruta exige un rol (ej: 'admin') y el usuario tiene rol de 'customer', lo pateamos a la tienda
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  // 4. Si pasa todos los filtros, Outlet renderiza la página interna de forma segura
  return <Outlet />;
}