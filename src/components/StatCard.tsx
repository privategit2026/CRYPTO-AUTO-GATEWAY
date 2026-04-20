import type { LucideIcon } from 'lucide-react';
import { cx } from './ui';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  tone?: 'cyan' | 'green' | 'amber' | 'blue' | 'rose' | 'violet';
}

const toneClasses = {
  cyan: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20',
  green: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  amber: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  blue: 'text-sky-300 bg-sky-400/10 border-sky-400/20',
  rose: 'text-rose-300 bg-rose-400/10 border-rose-400/20',
  violet: 'text-violet-300 bg-violet-400/10 border-violet-400/20',
};

const StatCard = ({ title, value, subtitle, icon: Icon, tone = 'cyan' }: StatCardProps) => (
  <article className="rounded-lg border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="mt-2 truncate text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className={cx('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border', toneClasses[tone])}>
        <Icon size={20} />
      </div>
    </div>
  </article>
);

export default StatCard;
