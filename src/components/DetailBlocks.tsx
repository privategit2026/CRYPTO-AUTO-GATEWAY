import type { ReactNode } from 'react';
import CopyButton from './CopyButton';
import { cx } from './ui';

interface DetailItemProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}

const DetailItem = ({ label, value, valueClassName }: DetailItemProps) => (
  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
    <div className={cx('mt-2 text-sm font-semibold text-slate-100', valueClassName)}>{value}</div>
  </div>
);

interface DetailCopyProps {
  label: string;
  value: string;
  mono?: boolean;
}

const DetailCopy = ({ label, value, mono = true }: DetailCopyProps) => (
  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
    <div className="mt-2 flex items-center gap-2">
      <span className={cx('min-w-0 flex-1 break-all text-sm text-slate-200', mono && 'font-mono')}>{value}</span>
      <CopyButton label={label.toLowerCase()} value={value} />
    </div>
  </div>
);

interface MobileRowProps {
  label: string;
  value: ReactNode;
}

const MobileRow = ({ label, value }: MobileRowProps) => (
  <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/60 px-3 py-2">
    <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
    <span className="min-w-0 text-right text-sm text-slate-200">{value}</span>
  </div>
);

interface DataCardProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}

const DataCard = ({ children, onClick, className }: DataCardProps) => (
  <article
    className={cx(
      'w-full cursor-pointer rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-left shadow-lg shadow-slate-950/20 transition hover:border-cyan-400/30 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400/30',
      className,
    )}
    onClick={onClick}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    }}
    role="button"
    tabIndex={0}
  >
    {children}
  </article>
);

export { DataCard, DetailCopy, DetailItem, MobileRow };

