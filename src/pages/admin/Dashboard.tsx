import React, { useState, useEffect } from 'react';
import { addProduct, getProducts, updateProduct, deleteProduct, Product } from '../../services/products.service';
import { ADMIN_CATEGORIES } from '../../constants';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Remeras');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setImageUrl('');
    setCategory('Remeras');
    setEditingId(null);
    setMessage({ text: '', isError: false });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setImageUrl(product.imageUrl);
    setCategory(product.category);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Confirmar eliminación del producto?')) return;
    setLoading(true);
    const success = await deleteProduct(id);
    if (success) {
      setMessage({ text: '✅ Producto eliminado con éxito', isError: false });
      await loadProducts();
    } else {
      setMessage({ text: '❌ Error al eliminar el producto', isError: true });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', isError: false });

    const productData = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      imageUrl: imageUrl || 'https://via.placeholder.com/500x500?text=Producto',
      category
    };

    let success;
    if (editingId) {
      success = await updateProduct(editingId, productData);
      if (success) {
        setMessage({ text: '✅ Producto actualizado con éxito', isError: false });
      } else {
        setMessage({ text: '❌ Error al actualizar el producto', isError: true });
      }
    } else {
      success = await addProduct(productData);
      if (success) {
        setMessage({ text: '✅ Producto creado con éxito', isError: false });
      } else {
        setMessage({ text: '❌ Error al crear el producto', isError: true });
      }
    }

    if (success) {
      await loadProducts();
      resetForm();
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-gray-900">📊 Panel de Administración</h1>
              <p className="text-sm text-gray-500 mt-1">{editingId ? 'Editá el producto' : 'Cargá nuevos productos'} al catálogo en tiempo real.</p>
            </div>
            {editingId && (
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕ Cancelar
              </button>
            )}
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-medium mb-6 text-center border ${
              message.isError ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Ej: Campera de Abrigo Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  {ADMIN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Detalles del material, talles, etc..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Precio ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Ej: 45000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Inicial</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Ej: 10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL de la Imagen</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="https://images.unsplash.com/... o enlace de internet"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm transition-colors ${
                  loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? 'Procesando...' : editingId ? '📝 Guardar Cambios' : '📦 Crear Producto'}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Productos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-black text-gray-900 mb-6">📋 Productos en el Catálogo</h2>
          {products.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay productos aún. Crea uno arriba.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-3 bg-gray-100"
                  />
                  <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                  <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-sm font-bold text-gray-900">${product.price.toLocaleString('es-AR')}</span>
                      <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}