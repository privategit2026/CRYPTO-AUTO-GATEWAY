import { NavLink } from 'react-router-dom';
import {
  Activity,
  ArrowDownToLine,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { cx } from './ui';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/deposits', label: 'Deposits', icon: ArrowDownToLine },
  { path: '/wallets', label: 'Wallets', icon: Wallet },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/transactions', label: 'Transactions', icon: CreditCard },
  { path: '/api-keys', label: 'API Keys', icon: KeyRound },
  { path: '/activity', label: 'Activity', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const AppSidebar = ({ isOpen, onClose }: AppSidebarProps) => (
  <>
    {isOpen && (
      <button
        aria-label="Close navigation"
        className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        type="button"
      />
    )}

    <aside
      className={cx(
        'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-base font-bold text-white">CryptoGate</p>
            <p className="text-xs font-medium text-slate-500">Admin Console</p>
          </div>
        </div>
        <button
          aria-label="Close navigation"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white lg:hidden"
          onClick={onClose}
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-400/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white',
                )
              }
              end={path === '/'}
              key={path}
              onClick={onClose}
              to={path}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
            <ShieldCheck size={16} />
            System Online
          </div>
          <p className="mt-1 text-xs text-emerald-100/60">Mock gateway monitoring is healthy.</p>
        </div>
      </div>
    </aside>
  </>
);

export default AppSidebar;
