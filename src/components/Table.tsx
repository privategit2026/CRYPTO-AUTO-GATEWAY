import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
}

function Table<T extends { id: number }>({
  columns,
  data,
  onSort,
  sortKey,
  sortDirection,
  emptyMessage = 'No data found',
}: TableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-800 border-b border-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                  col.sortable ? 'cursor-pointer hover:text-white select-none' : ''
                }`}
                onClick={() => col.sortable && handleSort(String(col.key))}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="flex flex-col">
                      <ChevronUp
                        size={10}
                        className={sortKey === col.key && sortDirection === 'asc' ? 'text-blue-400' : 'text-gray-600'}
                      />
                      <ChevronDown
                        size={10}
                        className={sortKey === col.key && sortDirection === 'desc' ? 'text-blue-400' : 'text-gray-600'}
                      />
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                className="bg-gray-900 hover:bg-gray-800/60 transition-colors"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-gray-300 whitespace-nowrap">
                    {col.render
                      ? col.render(
                          col.key.toString().includes('.')
                            ? (col.key.toString().split('.').reduce((obj: unknown, key) => (obj as Record<string, unknown>)?.[key], row) as unknown)
                            : (row as Record<string, unknown>)[col.key.toString()],
                          row
                        )
                      : String((row as Record<string, unknown>)[col.key.toString()] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
