import React, { createContext, useContext, useMemo, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  notify: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = (message: string, variant: ToastVariant = 'info') => {
    const id = `${variant}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast: ToastItem = { id, message, variant };
    setToasts((current) => [toast, ...current]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4500);
  };

  const dismiss = (id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  const value = useMemo(() => ({ notify, dismiss }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl px-4 py-3 shadow-2xl border border-white/10 backdrop-blur-xl text-sm font-semibold text-slate-900 dark:text-slate-100 transition-all ${
              toast.variant === 'success'
                ? 'bg-emerald-100/95 dark:bg-emerald-500/15 border-emerald-400/20'
                : toast.variant === 'error'
                ? 'bg-rose-100/95 dark:bg-rose-500/15 border-rose-400/20'
                : 'bg-slate-100/95 dark:bg-slate-800/95 border-slate-300/20'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span>{toast.message}</span>
              <button className="text-xs opacity-80 hover:opacity-100" onClick={() => dismiss(toast.id)}>
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
