import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Credenciales inválidas. Revisá tu email y contraseña.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('El email ya está registrado por otra cuenta.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Ocurrió un error inesperado. Intentalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Error al autenticar con Google.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        
        {/* Encabezado */}
        <div className="text-center">
          <span className="text-4xl">🛍️</span>
          <h2 className="mt-4 text-3xl font-black text-gray-900 dark:text-white">
            {isRegister ? 'Creá tu cuenta' : 'Ingresá a tu cuenta'}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isRegister ? 'Disfrutá de la mejor experiencia e-commerce' : '¡Qué bueno verte de nuevo!'}
          </p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl font-medium text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Formulario */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm mt-2"
          >
            {loading ? 'Procesando...' : isRegister ? 'Registrarme' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-semibold">O continuá con</span></div>
        </div>

        {/* Botón de Google */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Ingresar con Google
        </button>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline transition-colors"
          >
            {isRegister ? '¿Ya tenés una cuenta? Iniciá sesión' : '¿No tenés cuenta? Registrate acá'}
          </button>
        </div>

      </div>
    </div>
  );
}