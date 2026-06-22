import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import { getProducts } from '../../services/db';

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Al montar el componente, pedimos los productos a Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado / Banner */}
        <div className="text-center my-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Descubrí las últimas <span className="text-indigo-600">Tendencias</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-base text-gray-500">
            Productos seleccionados con la mejor calidad y envío rápido a todo el país.
          </p>
        </div>

        {/* Grilla de Productos o Estado de Carga */}
        {loading ? (
          // Skeletons: Animación de carga para que no quede en blanco
          <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // Estado Vacío: Si Firestore no tiene productos o hubo un error
          <div className="mt-12 text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
            <span className="text-4xl">📭</span>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay productos disponibles</h3>
            <p className="mt-1 text-sm text-gray-500">Volvé más tarde para ver nuestras novedades.</p>
          </div>
        ) : (
          // Grilla de Productos Reales
          <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="group relative bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="aspect-w-4 aspect-h-3 bg-gray-200 h-48 overflow-hidden group-hover:opacity-95 transition-opacity">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-center object-cover"
                    onError={(e) => { // Fallback si la imagen de Firebase se rompe
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x500?text=Sin+Imagen';
                    }}
                  />
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-gray-900">
                      ${product.price.toLocaleString('es-AR')}
                    </span>
                    
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className={`flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold transition-colors gap-1.5 shadow-sm 
                        ${product.stock > 0 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      {product.stock > 0 ? (
                        <><span>🛒</span> Agregar</>
                      ) : (
                        'Sin Stock'
                      )}
                    </button>
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