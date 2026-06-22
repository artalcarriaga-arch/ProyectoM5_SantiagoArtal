import { useCart } from '../../context/CartContext';
import { Product } from '../../types';

// Productos de prueba temporales para renderizar la interfaz
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Zapatillas Running Pro',
    description: 'Amortiguación máxima para tus entrenamientos diarios de alta intensidad.',
    price: 89999,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    stock: 5,
    category: 'Calzado'
  },
  {
    id: '2',
    name: 'Remera Oversize Algodón',
    description: 'Algodón 100% premium, corte urbano y calce súper cómodo.',
    price: 24500,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80',
    stock: 12,
    category: 'Indumentaria'
  },
  {
    id: '3',
    name: 'Gorra Trucker Urban',
    description: 'Visera curva con red transpirable y broche ajustable clásico.',
    price: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80',
    stock: 8,
    category: 'Accesorios'
  },
  {
    id: '4',
    name: 'Mochila Técnica Impermeable',
    description: 'Compartimento acolchado para notebook y bolsillos organizadores.',
    price: 48000,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    stock: 3,
    category: 'Accesorios'
  }
];

export default function Home() {
  const { addToCart } = useCart();

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

        {/* Grilla de Productos */}
        <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {MOCK_PRODUCTS.map((product) => (
            <div 
              key={product.id} 
              className="group relative bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Contenedor de la Imagen */}
              <div className="aspect-w-4 aspect-h-3 bg-gray-200 h-48 overflow-hidden group-hover:opacity-95 transition-opacity">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-center object-cover"
                />
              </div>

              {/* Detalles del Producto */}
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
                    className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors gap-1.5 shadow-sm shadow-indigo-100"
                  >
                    <span>🛒</span>
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}