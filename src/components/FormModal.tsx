import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cx } from './ui';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const FormModal = ({ isOpen, onClose, title, description, children, size = 'md' }: FormModalProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (event.shiftKey) {
          if (active === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <section
        aria-modal="true"
        className={cx(
          'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-2xl shadow-black/40',
          sizeClasses[size],
        )}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
          </div>
          <button
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4" ref={panelRef}>
          {children}
        </div>
      </section>
    </div>
  );
};

export default FormModal;
