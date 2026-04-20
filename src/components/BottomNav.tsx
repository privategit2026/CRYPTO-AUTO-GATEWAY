import { NavLink } from 'react-router-dom';
import {
  Activity,
  ArrowDownToLine,
  LayoutDashboard,
  Wallet,
} from 'lucide-react';
import { cx } from './ui';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/deposits', label: 'Incoming', icon: ArrowDownToLine },
  { path: '/activity', label: 'Logs', icon: Activity },
  { path: '/wallets', label: 'Wallets', icon: Wallet },
];

const BottomNav = () => (
  <nav data-testid="bottom-nav" className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl lg:hidden">
    <div className="flex overflow-x-auto scrollbar-none">
      {navItems.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            cx(
              'flex min-w-[4rem] flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-semibold transition-colors',
              isActive
                ? 'text-cyan-300'
                : 'text-slate-500 hover:text-slate-200',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cx(
                  'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                  isActive ? 'bg-cyan-400/10' : '',
                )}
              >
                <Icon size={17} />
              </span>
              <span className="leading-none">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default BottomNav;
