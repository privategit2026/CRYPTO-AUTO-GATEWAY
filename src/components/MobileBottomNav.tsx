import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Activity, ArrowDownToLine, LayoutDashboard, Settings, Wallet } from 'lucide-react';
import { cx } from './ui';

const items: Array<{ to: string; label: string; icon: LucideIcon; end?: boolean }> = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/deposits', label: 'Incoming', icon: ArrowDownToLine },
  { to: '/wallets', label: 'Wallets', icon: Wallet },
  { to: '/activity', label: 'Logs', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const MobileBottomNav = () => (
  <nav
    aria-label="Primary"
    className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/90 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur lg:hidden"
  >
    <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          aria-label={label}
          className={({ isActive }) =>
            cx(
              'flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400/30',
              isActive
                ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-400/20'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white',
            )
          }
          end={end ?? false}
          key={to}
          to={to}
        >
          <Icon size={18} />
          <span className="leading-none">{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);

export default MobileBottomNav;
