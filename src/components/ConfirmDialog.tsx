import { AlertTriangle } from 'lucide-react';
import FormModal from './FormModal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning';
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onClose,
}: ConfirmDialogProps) => {
  const confirmClass =
    tone === 'danger'
      ? 'bg-rose-600 text-white hover:bg-rose-500'
      : 'bg-amber-500 text-slate-950 hover:bg-amber-400';

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-300">
            <AlertTriangle size={20} />
          </div>
          <p className="text-sm leading-6 text-slate-300">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            onClick={onClose}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${confirmClass}`}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </FormModal>
  );
};

export default ConfirmDialog;
