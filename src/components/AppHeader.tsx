import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Plus, Search, Settings, UserRound } from 'lucide-react';
import Popover from './Popover';
import StatusBadge from './StatusBadge';
import { useStore } from '../store/useStore';
import { cx } from './ui';
import { useToast } from './toastContext';

interface AppHeaderProps {
  onMenuToggle: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenCommandPalette: (initialQuery?: string) => void;
}

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/deposits': 'Deposits',
  '/wallets': 'Wallets',
  '/users': 'Users',
  '/transactions': 'Transactions',
  '/api-keys': 'API Keys',
  '/activity': 'Activity',
  '/settings': 'Settings',
};

const AppHeader = ({ onMenuToggle, searchQuery, onSearchChange, onOpenCommandPalette }: AppHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const title = routeTitles[location.pathname] ?? 'CryptoGate Admin';
  const activityLog = useStore((state) => state.activityLog);
  const notificationReadIds = useStore((state) => state.notificationReadIds);
  const markNotificationRead = useStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useStore((state) => state.markAllNotificationsRead);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  const notifications = activityLog.slice(0, 8);
  const unreadCount = notifications.filter((entry) => !notificationReadIds.includes(entry.id)).length;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open navigation"
            className="rounded-lg border border-slate-800 p-2 text-slate-300 transition hover:bg-slate-900 hover:text-white lg:hidden"
            onClick={onMenuToggle}
            type="button"
          >
            <Menu size={20} />
          </button>
          <div className="hidden min-w-0 sm:block">
            <p className="text-xs font-medium uppercase text-slate-500">Workspace</p>
            <p className="truncate text-sm font-semibold text-white">{title}</p>
          </div>
        </div>

        <div className="relative hidden w-full max-w-xl md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/70 pl-9 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onOpenCommandPalette(searchQuery);
              if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                onOpenCommandPalette(searchQuery);
              }
            }}
            placeholder="Search dashboard, deposits, wallets, users..."
            type="search"
            value={searchQuery}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Open command palette"
            className="rounded-lg border border-slate-800 p-2 text-slate-300 transition hover:bg-slate-900 hover:text-white md:hidden"
            onClick={() => onOpenCommandPalette(searchQuery)}
            type="button"
          >
            <Search size={18} />
          </button>

          <Popover
            open={quickOpen}
            onClose={() => setQuickOpen(false)}
            widthClassName="w-64"
            anchor={
              <button
                aria-label="Quick actions"
                className="hidden items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 sm:flex"
                onClick={() => setQuickOpen((value) => !value)}
                type="button"
              >
                <Plus size={16} />
                Quick Add
              </button>
            }
          >
            <div className="p-2">
              <button
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
                onClick={() => {
                  setQuickOpen(false);
                  navigate('/deposits?new=1');
                }}
                type="button"
              >
                Add Deposit <span className="text-xs text-slate-500">D</span>
              </button>
              <button
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
                onClick={() => {
                  setQuickOpen(false);
                  navigate('/wallets?new=1');
                }}
                type="button"
              >
                Add Wallet <span className="text-xs text-slate-500">W</span>
              </button>
              <button
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
                onClick={() => {
                  setQuickOpen(false);
                  navigate('/users?new=1');
                }}
                type="button"
              >
                Add User <span className="text-xs text-slate-500">U</span>
              </button>
              <button
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
                onClick={() => {
                  setQuickOpen(false);
                  navigate('/api-keys?new=1');
                }}
                type="button"
              >
                Add API Key <span className="text-xs text-slate-500">K</span>
              </button>
            </div>
          </Popover>

          <Popover
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            widthClassName="w-[22rem]"
            anchor={
              <button
                aria-label="Notifications"
                className="relative rounded-lg border border-slate-800 p-2 text-slate-300 transition hover:bg-slate-900 hover:text-white"
                onClick={() => setNotificationsOpen((value) => !value)}
                type="button"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-300 px-1 text-[11px] font-bold text-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>
            }
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Notifications</p>
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md px-2 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
                  onClick={() => {
                    markAllNotificationsRead();
                    showToast('Notifications cleared', 'info');
                  }}
                  type="button"
                >
                  Mark all read
                </button>
                <button
                  className="rounded-md px-2 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/activity');
                  }}
                  type="button"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-auto p-2">
              {notifications.length === 0 ? (
                <div className="rounded-md px-3 py-8 text-center text-sm text-slate-500">No notifications.</div>
              ) : (
                notifications.map((entry) => {
                  const unread = !notificationReadIds.includes(entry.id);
                  return (
                    <button
                      className={cx(
                        'w-full rounded-md px-3 py-2 text-left transition hover:bg-slate-900',
                        unread && 'bg-cyan-400/5',
                      )}
                      key={entry.id}
                      onClick={() => {
                        markNotificationRead(entry.id);
                        setNotificationsOpen(false);
                        navigate(`/activity?selected=${entry.id}`);
                      }}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{entry.action}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{entry.description}</p>
                        </div>
                        <StatusBadge value={entry.severity} withIcon />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                        <span className="uppercase">{entry.category}</span>
                        <span>{entry.timestamp}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Popover>

          <Popover
            open={userMenuOpen}
            onClose={() => setUserMenuOpen(false)}
            widthClassName="w-56"
            anchor={
              <button
                aria-label="Open user menu"
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-slate-200 transition hover:bg-slate-800"
                onClick={() => setUserMenuOpen((value) => !value)}
                type="button"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-cyan-200">
                  <UserRound size={15} />
                </span>
                <span className="hidden text-sm font-semibold sm:inline">Admin</span>
              </button>
            }
          >
            <div className="border-b border-slate-800 px-4 py-3">
              <p className="text-sm font-semibold text-white">Admin</p>
              <p className="text-xs text-slate-500">Enterprise Mock User</p>
            </div>
            <div className="p-2">
              <Link
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
                onClick={() => setUserMenuOpen(false)}
                to="/settings"
              >
                <Settings size={16} />
                Preferences
              </Link>
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
                onClick={() => {
                  setUserMenuOpen(false);
                  onOpenCommandPalette('');
                }}
                type="button"
              >
                <Search size={16} />
                Command Palette
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
                onClick={() => {
                  setUserMenuOpen(false);
                  showToast('Signed out (mock)', 'info');
                  navigate('/');
                }}
                type="button"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </Popover>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
