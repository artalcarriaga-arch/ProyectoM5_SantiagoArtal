import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { createOrderInDB } from '../../services/orderService';

export default function Checkout() {
  const { items, total, clearCart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0) return;

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
      }));

      const newId = await createOrderInDB(
        user.uid,
        user.email || 'anonimo@shop.com',
        user.displayName || user.email?.split('@')[0] || 'Cliente',
        orderItems,
        total
      );
      setOrderId(newId);
      clearCart();
    } catch (error) {
      console.error("Error al procesar la orden:", error);
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center space-y-4">
        <span className="text-5xl">🎉</span>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">¡Compra Confirmada!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tu orden fue procesada con éxito de manera simulada.
        </p>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border border-gray-100 dark:border-gray-600 text-xs font-mono text-gray-600 dark:text-gray-300">
          ID de Orden: <span className="font-bold text-indigo-600 dark:text-indigo-400">{orderId}</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Resumen de tu Compra</h1>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Tu carrito está vacío.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-sm font-bold text-indigo-600 underline">
            Ir a buscar productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  className="w-16 h-16 object-cover rounded-lg bg-gray-50 dark:bg-gray-700 shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.product.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">${item.product.price.toLocaleString('es-AR')} c/u</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-gray-900 dark:text-white w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="ml-2 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <span className="text-sm font-black text-gray-900 dark:text-white shrink-0">
                  ${(item.product.price * item.quantity).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
            <button
              onClick={clearCart}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 font-semibold transition-colors mt-1"
            >
              🗑 Vaciar carrito
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Total de la Orden</h3>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
              <span className="text-base font-black text-gray-900">${total.toLocaleString('es-AR')}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-100"
            >
              {loading ? 'Procesando...' : user ? 'Confirmar Pago Simulado' : 'Iniciá sesión para pagar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
