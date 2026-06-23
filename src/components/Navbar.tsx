import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
  const { user, profile } = useAuth();
  const { items } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Nombre de la tienda */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
              <span>🛍️</span>
              <span className="hidden sm:inline tracking-tight text-gray-900 dark:text-white font-extrabold">
                Multi<span className="text-indigo-600">Shop</span>
              </span>
            </Link>
          </div>

          {/* Bloque de usuario y acciones */}
          <div className="flex items-center gap-4">
            {/* Toggle Tema */}
            <button
              onClick={toggleTheme}
              className="text-xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {user ? (
              <>
                {/* Info del usuario logueado */}
                <div className="flex flex-col items-end text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">{user.email}</span>
                  {profile?.role === 'admin' && (
                    <span className="mt-0.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-150 dark:border-indigo-700 rounded-full font-bold scale-90 origin-right">
                      Administrador
                    </span>
                  )}
                </div>

                <Link
                  to="/checkout"
                  className="relative text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
                >
                  🛒 Carrito
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black rounded-full h-5 w-5 flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </Link>

                <Link
                  to="/orders"
                  className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
                >
                  📋 Órdenes
                </Link>

                {profile?.role === 'admin' && (
                  <div className="flex gap-2">
                    <Link
                      to="/admin"
                      className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                    >
                      ⚙️ Admin
                    </Link>
                    <Link
                      to="/admin/orders"
                      className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                    >
                      📦 Órdenes de Clientes
                    </Link>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 px-4 py-2 rounded-lg transition-all shadow-sm shadow-indigo-100 dark:shadow-indigo-900"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}