import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowDownToLine, CreditCard, KeyRound, Search, UserRound, Wallet } from 'lucide-react';
import FormModal from './FormModal';
import StatusBadge from './StatusBadge';
import { cx, shortAddress } from './ui';
import { useStore } from '../store/useStore';

type ResultKind = 'deposit' | 'wallet' | 'user' | 'apiKey' | 'transaction' | 'activity';

interface ResultItem {
  kind: ResultKind;
  id: number;
  title: string;
  subtitle: string;
  route: string;
  status?: string;
  meta?: ReactNode;
}

const kindIcon = {
  deposit: ArrowDownToLine,
  wallet: Wallet,
  user: UserRound,
  apiKey: KeyRound,
  transaction: CreditCard,
  activity: Activity,
} as const;

interface CommandPaletteProps {
  open: boolean;
  initialQuery?: string;
  onClose: () => void;
}

const CommandPalette = ({ open, initialQuery = '', onClose }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const deposits = useStore((state) => state.deposits);
  const wallets = useStore((state) => state.wallets);
  const users = useStore((state) => state.users);
  const apiKeys = useStore((state) => state.apiKeys);
  const transactions = useStore((state) => state.transactions);
  const activityLog = useStore((state) => state.activityLog);

  const [query, setQuery] = useState(() => initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as ResultItem[];

    const matches = <T,>(value: T) => String(value).toLowerCase().includes(q);

    const depositResults: ResultItem[] = deposits
      .filter((d) => matches(d.user) || matches(d.txid) || matches(d.address) || matches(d.id))
      .slice(0, 6)
      .map((d) => ({
        kind: 'deposit',
        id: d.id,
        title: `Deposit #${d.id} - ${d.user}`,
        subtitle: `${d.network} - ${d.date}`,
        route: `/deposits?selected=${d.id}`,
        status: d.status,
        meta: <span className="font-mono text-xs text-slate-400">{shortAddress(d.txid, 10, 8)}</span>,
      }));

    const walletResults: ResultItem[] = wallets
      .filter((w) => matches(w.user) || matches(w.address) || matches(w.id))
      .slice(0, 6)
      .map((w) => ({
        kind: 'wallet',
        id: w.id,
        title: `Wallet #${w.id} - ${w.user}`,
        subtitle: `${w.network} - ${w.createdAt}`,
        route: `/wallets?selected=${w.id}`,
        status: w.status,
        meta: <span className="font-mono text-xs text-slate-400">{shortAddress(w.address, 10, 8)}</span>,
      }));

    const userResults: ResultItem[] = users
      .filter((u) => matches(u.name) || matches(u.email) || matches(u.id))
      .slice(0, 6)
      .map((u) => ({
        kind: 'user',
        id: u.id,
        title: u.name,
        subtitle: `${u.role} - ${u.email}`,
        route: `/users?selected=${u.id}`,
        status: u.status,
      }));

    const apiKeyResults: ResultItem[] = apiKeys
      .filter((k) => matches(k.name) || matches(k.merchant) || matches(k.key) || matches(k.id))
      .slice(0, 6)
      .map((k) => ({
        kind: 'apiKey',
        id: k.id,
        title: k.name,
        subtitle: `${k.merchant} - ${k.createdAt}`,
        route: `/api-keys?selected=${k.id}`,
        status: k.status,
        meta: <span className="font-mono text-xs text-slate-400">{shortAddress(k.key, 14, 6)}</span>,
      }));

    const txResults: ResultItem[] = transactions
      .filter((t) => matches(t.orderId) || matches(t.merchant) || matches(t.txHash) || matches(t.id))
      .slice(0, 6)
      .map((t) => ({
        kind: 'transaction',
        id: t.id,
        title: `${t.orderId} - ${t.merchant}`,
        subtitle: `${t.network} - ${t.createdAt.split(' ')[0]}`,
        route: `/transactions?selected=${t.id}`,
        status: t.status,
        meta: <span className="font-mono text-xs text-slate-400">{shortAddress(t.txHash, 10, 8)}</span>,
      }));

    const activityResults: ResultItem[] = activityLog
      .filter((e) => matches(e.action) || matches(e.description) || matches(e.user) || matches(e.id))
      .slice(0, 6)
      .map((e) => ({
        kind: 'activity',
        id: e.id,
        title: e.action,
        subtitle: `${e.category} - ${e.timestamp}`,
        route: `/activity?selected=${e.id}`,
        status: e.severity,
      }));

    return [...depositResults, ...walletResults, ...userResults, ...apiKeyResults, ...txResults, ...activityResults].slice(
      0,
      12,
    );
  }, [activityLog, apiKeys, deposits, query, transactions, users, wallets]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((value) => Math.min(results.length - 1, value + 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((value) => Math.max(0, value - 1));
      } else if (event.key === 'Enter') {
        const item = results[activeIndex];
        if (!item) return;
        navigate(item.route);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, navigate, onClose, open, results]);

  return (
    <FormModal
      description="Search across all mock data and jump to details."
      isOpen={open}
      onClose={onClose}
      size="xl"
      title="Command Palette"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            autoFocus
            className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search deposits, wallets, users, api keys, transactions, activity..."
            value={query}
          />
        </div>

        {results.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-10 text-center text-sm text-slate-500">
            Type to search across all entities.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60">
            {results.map((item, index) => {
              const Icon = kindIcon[item.kind];
              const active = index === activeIndex;
              return (
                <button
                  className={cx(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition',
                    active ? 'bg-cyan-400/10' : 'hover:bg-slate-900/70',
                  )}
                  key={`${item.kind}-${item.id}`}
                  onClick={() => {
                    navigate(item.route);
                    onClose();
                  }}
                  type="button"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-cyan-200">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">{item.subtitle}</span>
                  </span>
                  {item.meta}
                  {item.status && <StatusBadge value={item.status} withIcon />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default CommandPalette;
