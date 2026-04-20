import type { ReactNode } from 'react';

interface TableToolbarProps {
  title?: string;
  resultCount?: number;
  children?: ReactNode;
}

const TableToolbar = ({ title, resultCount, children }: TableToolbarProps) => (
  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
      {typeof resultCount === 'number' && (
        <p className="mt-1 text-xs text-slate-500">{resultCount.toLocaleString()} records shown</p>
      )}
    </div>
    {children && <div className="flex flex-wrap gap-2">{children}</div>}
  </div>
);

export default TableToolbar;
