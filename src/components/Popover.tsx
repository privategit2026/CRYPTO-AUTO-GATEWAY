import type { ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import { cx } from './ui';

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  anchor: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  widthClassName?: string;
}

const Popover = ({ open, onClose, anchor, children, align = 'right', widthClassName = 'w-80' }: PopoverProps) => {
  const panelId = useId();
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();
  }, [open]);

  return (
    <div className="relative">
      <div ref={anchorRef} aria-controls={panelId} aria-expanded={open}>
        {anchor}
      </div>
      {open && (
        <div
          className={cx(
            'absolute top-full z-50 mt-2 rounded-lg border border-slate-800 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur',
            widthClassName,
            align === 'right' ? 'right-0' : 'left-0',
          )}
          id={panelId}
          ref={panelRef}
          role="dialog"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Popover;
