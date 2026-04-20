import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ToastContext, type ToastTone } from './toastContext';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

const toneConfig = {
  success: { icon: CheckCircle2, className: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100' },
  error: { icon: XCircle, className: 'border-rose-400/20 bg-rose-500/10 text-rose-100' },
  info: { icon: Info, className: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100' },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 2800);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => {
          const config = toneConfig[toast.tone];
          const Icon = config.icon;
          return (
            <div
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-xl shadow-black/30 backdrop-blur ${config.className}`}
              key={toast.id}
              role="status"
            >
              <Icon size={18} />
              <p className="min-w-0 flex-1 text-sm font-medium">{toast.message}</p>
              <button
                aria-label="Dismiss notification"
                className="rounded p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
                onClick={() => dismiss(toast.id)}
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
