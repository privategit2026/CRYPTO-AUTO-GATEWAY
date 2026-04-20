import { cx } from './ui';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

const Tabs = ({ items, value, onChange, ariaLabel }: TabsProps) => (
  <div
    className="mb-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 p-1"
    role="tablist"
    aria-label={ariaLabel}
  >
    <div className="flex flex-wrap gap-1">
      {items.map((item, index) => {
        const isActive = item.value === value;
        return (
          <button
            aria-selected={isActive}
            className={cx(
              'min-h-10 flex-1 rounded-md px-3 py-2 text-sm font-semibold transition sm:flex-none',
              isActive
                ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white',
            )}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              const nextIndex =
                event.key === 'ArrowRight'
                  ? (index + 1) % items.length
                  : (index - 1 + items.length) % items.length;
              onChange(items[nextIndex].value);
            }}
            key={item.value}
            onClick={() => onChange(item.value)}
            role="tab"
            type="button"
          >
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span className={cx('ml-2 rounded-full px-2 py-0.5 text-xs', isActive ? 'bg-slate-950/10' : 'bg-slate-800 text-slate-500')}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default Tabs;
