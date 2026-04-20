import type { ReactNode } from 'react';
import { Filter } from 'lucide-react';
import SearchInput from './SearchInput';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  children?: ReactNode;
}

const FilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  children,
}: FilterBarProps) => (
  <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/55 p-3 md:flex-row md:items-center">
    <SearchInput
      className="min-w-0 flex-1"
      onChange={onSearchChange}
      placeholder={searchPlaceholder}
      value={searchValue}
    />
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <label className="relative" key={filter.label}>
          <span className="sr-only">{filter.label}</span>
          <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <select
            className="h-10 min-w-40 appearance-none rounded-lg border border-slate-700 bg-slate-950/80 pl-8 pr-8 text-sm font-medium text-slate-200 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
            onChange={(event) => filter.onChange(event.target.value)}
            value={filter.value}
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      {children}
    </div>
  </div>
);

export default FilterBar;
