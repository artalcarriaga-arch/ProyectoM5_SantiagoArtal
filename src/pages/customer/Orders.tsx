import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserOrders, Order } from '../../services/orderService';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getUserOrders(user.uid);
        setOrders(data);
      } catch (error) {
        console.error('Error al cargar órdenes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳ Pendiente';
      case 'processing':
        return '📦 Procesando';
      case 'completed':
        return '✅ Entregada';
      case 'cancelled':
        return '❌ Cancelada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">📋 Mis Órdenes</h1>
        <p className="text-sm text-gray-500 mt-1">Aquí puedes ver el estado de todas tus compras.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 max-w-md mx-auto">
          <span className="text-4xl">🛒</span>
          <h3 className="mt-4 text-sm font-bold text-gray-900">Aún no has realizado compras</h3>
          <p className="mt-1 text-xs text-gray-500">Explorá nuestro catálogo y realiza tu primer pedido.</p>
          <a href="/" className="mt-4 inline-block text-sm font-bold text-indigo-600 underline">
            Ir a la tienda
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Encabezado de la orden */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Orden</p>
                    <p className="font-mono text-sm font-bold text-gray-900">{order.id}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium">Fecha</p>
                    <p className="text-sm font-bold text-gray-900">
                      {order.createdAt.toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>

                {/* Ítems de la orden */}
                <div className="mb-6">
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg bg-white"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">Cant: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Unitario</p>
                          <p className="text-sm font-bold text-gray-900">${item.price.toLocaleString('es-AR')}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-500">Subtotal</p>
                          <p className="text-sm font-bold text-indigo-600">
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium mb-1">Total</p>
                    <p className="text-2xl font-black text-gray-900">
                      ${order.total.toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
