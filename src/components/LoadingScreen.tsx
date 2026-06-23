export default function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="text-6xl animate-bounce">🛍️</div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black">
            <span className="text-gray-900">Multi</span><span className="text-indigo-600">Shop</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">Cargando tu tienda...</p>
        </div>
        <div className="flex justify-center gap-1">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
