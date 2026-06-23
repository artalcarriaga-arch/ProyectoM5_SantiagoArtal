import { useToast } from '../hooks/useToast';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getStylesByType = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400';
      case 'info':
        return 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-400';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border
            backdrop-blur-sm shadow-lg pointer-events-auto
            animate-in fade-in slide-in-from-bottom-4 duration-300
            ${getStylesByType(toast.type)}
          `}
        >
          <span className="text-lg">{getIconByType(toast.type)}</span>
          <span className="font-semibold text-sm">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
