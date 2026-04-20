import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

const EmptyState = ({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) => (
  <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/60 px-6 py-10 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300">
      <Icon size={22} />
    </div>
    <h3 className="text-sm font-semibold text-white">{title}</h3>
    {description && <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
