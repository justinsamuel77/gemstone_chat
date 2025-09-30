import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from './utils';
import { Icons } from './icons';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts, removeToast } = context;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(onRemove, 300);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Icons.CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <Icons.AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <Icons.AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Icons.AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'min-w-80 max-w-md p-4 border rounded-lg shadow-lg transition-all duration-300',
        getToastStyles(),
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      )}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icons.X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Toast function to use in components
export const toast = {
  success: (message: string, duration?: number) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'success', message, duration }
      }));
    }
  },
  error: (message: string, duration?: number) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'error', message, duration }
      }));
    }
  },
  warning: (message: string, duration?: number) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'warning', message, duration }
      }));
    }
  },
  info: (message: string, duration?: number) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'info', message, duration }
      }));
    }
  },
};

// Convenience function for showing toasts
export function showToast(message: string, type: ToastType = 'info', duration?: number) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('toast', {
      detail: { type, message, duration }
    }));
  }
}

// Global toast listener component
export function ToastListener() {
  const context = useContext(ToastContext);

  useEffect(() => {
    if (!context) return;

    const handleToastEvent = (event: CustomEvent) => {
      const { type, message, duration } = event.detail;
      context.addToast({ type, message, duration });
    };

    window.addEventListener('toast', handleToastEvent as EventListener);
    return () => {
      window.removeEventListener('toast', handleToastEvent as EventListener);
    };
  }, [context]);

  return null;
}