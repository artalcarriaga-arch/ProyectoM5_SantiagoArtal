export default function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="text-6xl animate-bounce">🛍️</div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black">
            <span className="text-gray-900 dark:text-white">Multi</span><span className="text-indigo-600 dark:text-indigo-400">Shop</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Cargando tu tienda...</p>
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
