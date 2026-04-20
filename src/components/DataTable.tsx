import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import EmptyState from './EmptyState';
import { cx } from './ui';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  emptyDescription?: string;
  mobileRender?: (row: T) => ReactNode;
}

const getValue = <T,>(row: T, key: keyof T | string) => {
  const keyString = String(key);
  if (!keyString.includes('.')) {
    return (row as Record<string, unknown>)[keyString];
  }

  return keyString
    .split('.')
    .reduce<unknown>((value, segment) => (value as Record<string, unknown> | undefined)?.[segment], row);
};

function DataTable<T extends { id: number | string }>({
  columns,
  data,
  onSort,
  onRowClick,
  sortKey,
  sortDirection,
  emptyMessage = 'No records found',
  emptyDescription,
  mobileRender,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    onSort(key, sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc');
  };

  if (data.length === 0) {
    return <EmptyState title={emptyMessage} description={emptyDescription} />;
  }

  return (
    <>
      {mobileRender && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
          {data.map((row) => (
            <div key={row.id}>{mobileRender(row)}</div>
          ))}
        </div>
      )}
      <div className={cx('overflow-hidden rounded-lg border border-slate-800 bg-slate-950/70', mobileRender && 'hidden lg:block')}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/90">
            <tr>
              {columns.map((column) => {
                const isSorted = sortKey === String(column.key);
                return (
                  <th
                    className={cx(
                      'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-slate-400',
                      column.sortable && 'cursor-pointer select-none transition hover:text-white',
                      column.className,
                    )}
                    key={String(column.key)}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                    scope="col"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {column.label}
                      {column.sortable && (
                        <span className="flex flex-col">
                          <ChevronUp
                            className={isSorted && sortDirection === 'asc' ? 'text-cyan-300' : 'text-slate-600'}
                            size={11}
                          />
                          <ChevronDown
                            className={isSorted && sortDirection === 'desc' ? 'text-cyan-300' : 'text-slate-600'}
                            size={11}
                          />
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((row) => (
              <tr
                className={cx('transition hover:bg-slate-900/80', onRowClick && 'cursor-pointer')}
                key={row.id}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(event) => {
                  if (!onRowClick) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRowClick(row);
                  }
                }}
                tabIndex={onRowClick ? 0 : -1}
              >
                {columns.map((column) => (
                  <td className={cx('whitespace-nowrap px-4 py-3 text-slate-300', column.className)} key={String(column.key)}>
                    {column.render ? column.render(getValue(row, column.key), row) : String(getValue(row, column.key) ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}

export default DataTable;
