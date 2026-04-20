import { CheckCircle2, Clock3, Loader2, PauseCircle, ShieldCheck, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from './ui';

type BadgeTone = 'green' | 'yellow' | 'blue' | 'purple' | 'red' | 'gray' | 'cyan' | 'orange';

const toneClasses: Record<BadgeTone, string> = {
  green: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  yellow: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  blue: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  purple: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
  red: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  gray: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
  orange: 'border-orange-400/20 bg-orange-400/10 text-orange-300',
};

const statusTone: Record<string, BadgeTone> = {
  // Common entity statuses
  active: 'green',
  inactive: 'gray',
  used: 'yellow',
  revoked: 'red',
  expired: 'gray',

  // Deposits
  pending: 'yellow',
  detected: 'blue',
  confirming: 'purple',
  completed: 'green',

  // Transactions
  processing: 'blue',
  confirmed: 'purple',
  failed: 'red',

  // System + activity
  online: 'green',
  success: 'green',
  error: 'red',
  warning: 'orange',

  // Roles
  admin: 'blue',
  manager: 'purple',
  viewer: 'gray',

  // Permissions
  read: 'cyan',
  write: 'orange',
  webhooks: 'purple',

  // Categories
  deposit: 'blue',
  wallet: 'cyan',
  user: 'gray',
  api: 'orange',
  system: 'gray',
  security: 'red',
};

const statusIcon: Record<string, ReactNode> = {
  active: <CheckCircle2 size={12} />,
  completed: <CheckCircle2 size={12} />,
  online: <CheckCircle2 size={12} />,
  pending: <Clock3 size={12} />,
  detected: <ShieldCheck size={12} />,
  confirming: <Loader2 size={12} className="animate-spin" />,
  inactive: <PauseCircle size={12} />,
  failed: <XCircle size={12} />,
  revoked: <XCircle size={12} />,
};

interface StatusBadgeProps {
  value: string;
  label?: string;
  tone?: BadgeTone;
  withIcon?: boolean;
  className?: string;
}

const formatLabel = (value: string) =>
  value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const StatusBadge = ({ value, label, tone, withIcon = false, className }: StatusBadgeProps) => {
  const normalized = value.toLowerCase();
  const badgeTone = tone ?? statusTone[normalized] ?? 'gray';

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none',
        toneClasses[badgeTone],
        className,
      )}
    >
      {withIcon && statusIcon[normalized]}
      {label ?? formatLabel(value)}
    </span>
  );
};

export default StatusBadge;
