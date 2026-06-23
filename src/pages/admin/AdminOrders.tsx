import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { Order } from '../../services/orderService';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      const querySnapshot = await getDocs(ordersRef);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(data.sort((a, b) => b.createdAt?.toDate?.()?.getTime?.() - a.createdAt?.toDate?.()?.getTime?.() || 0));
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'processing' | 'completed' | 'cancelled') => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      await loadOrders();
    } catch (error) {
      console.error('Error al actualizar orden:', error);
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

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
      <div className="p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">📦 Órdenes de Clientes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administrá los pedidos de los clientes.</p>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500'
                }`}
              >
                {status === 'all' ? 'Todas' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <span className="text-4xl">📭</span>
            <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">No hay órdenes</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">No hay órdenes con este estado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Orden</p>
                      <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Cliente</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{order.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Fecha</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {order.createdAt?.toDate?.()?.toLocaleDateString('es-AR') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total</p>
                      <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                        ${order.total.toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">x{item.quantity}</span>
                        <span className="font-bold text-gray-900 dark:text-white">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </div>
                    <div className="flex gap-2">
                      {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
                        status !== order.status && (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.id!, status as any)}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors"
                          >
                            → {getStatusLabel(status)}
                          </button>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
