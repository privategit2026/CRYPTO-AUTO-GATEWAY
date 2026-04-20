import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '' }: SearchInputProps) => (
  <div className={`relative ${className}`}>
    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
    <input
      className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-9 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type="search"
      value={value}
    />
  </div>
);

export default SearchInput;
