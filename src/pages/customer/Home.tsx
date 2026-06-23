import { useEffect, useState } from 'react';
import { getProductsFromDB, Product } from '../../services/products.service.ts';
import { useDebounce } from '../../hooks/useDebounce.ts';
import { useCart } from '../../hooks/useCart';

const CATEGORIES = ['Todos', 'Remeras', 'Pantalones', 'Zapatillas', 'Accesorios'];

export default function Home() {
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await getProductsFromDB(selectedCategory);
        setProducts(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategory]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-indigo-100">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">Descubrí las últimas Tendencias</h1>
        <p className="text-indigo-100 text-sm sm:text-base max-w-md font-medium">
          Productos seleccionados con la mejor calidad y envío rápido a todo el país.
        </p>
      </div>

      <div className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        
        <div className="relative md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none snap-x">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap snap-center ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3 animate-pulse">
              <div className="bg-gray-200 h-48 w-full rounded-xl" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 max-w-md mx-auto">
          <span className="text-4xl">🔎</span>
          <h3 className="mt-4 text-sm font-bold text-gray-900">No encontramos productos</h3>
          <p className="mt-1 text-xs text-gray-500 px-4">
            Probá cambiando la categoría o revisando si el nombre está bien escrito.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white group rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-square mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-black text-indigo-600 tracking-wider uppercase">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2rem]">{product.description}</p>
              </div>
              
              <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="text-base font-black text-gray-900">
                  ${product.price.toLocaleString('es-AR')}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <span>+</span> Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}