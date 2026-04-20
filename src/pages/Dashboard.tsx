import { ArrowDownToLine, CheckCircle2, Clock3, RadioTower, TrendingUp, Users, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CopyButton from '../components/CopyButton';
import DataTable, { type Column } from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { currency, shortAddress } from '../components/ui';
import { type Deposit, useStore } from '../store/useStore';

const networkLabels = ['TRC20', 'ERC20', 'BEP20'] as const;

const Dashboard = () => {
  const navigate = useNavigate();
  const deposits = useStore((state) => state.deposits);
  const wallets = useStore((state) => state.wallets);
  const users = useStore((state) => state.users);

  const totalDeposits = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
  const pendingDeposits = deposits.filter((deposit) => deposit.status === 'pending').length;
  const completedDeposits = deposits.filter((deposit) => deposit.status === 'completed').length;
  const activeWallets = wallets.filter((wallet) => wallet.status === 'active').length;
  const activeUsers = users.filter((user) => user.status === 'active').length;
  const recentDeposits = [...deposits].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const columns: Column<Deposit>[] = [
    { key: 'id', label: 'ID', render: (value) => <span className="font-mono text-xs text-slate-500">#{String(value)}</span> },
    { key: 'user', label: 'User' },
    { key: 'amount', label: 'Amount', render: (value) => <span className="font-semibold text-emerald-300">{currency(Number(value))}</span> },
    { key: 'network', label: 'Network', render: (value) => <StatusBadge value={String(value)} tone="cyan" /> },
    { key: 'status', label: 'Status', render: (value) => <StatusBadge value={String(value)} withIcon /> },
    { key: 'date', label: 'Date' },
  ];

  const openDeposit = (deposit: Deposit) => {
    navigate(`/deposits?selected=${deposit.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        breadcrumbs={['CryptoGate', 'Overview']}
        description="A frontend-only control room for monitoring mock deposits, wallets, users, and network health."
        title="Dashboard"
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={ArrowDownToLine} subtitle={`${deposits.length} mock transactions`} title="Total Deposits" tone="cyan" value={currency(totalDeposits)} />
        <StatCard icon={Clock3} subtitle="Awaiting detection" title="Pending" tone="amber" value={pendingDeposits} />
        <StatCard icon={CheckCircle2} subtitle="Successfully processed" title="Completed" tone="green" value={completedDeposits} />
        <StatCard icon={Wallet} subtitle={`${activeWallets} active`} title="Wallets" tone="blue" value={wallets.length} />
        <StatCard icon={Users} subtitle={`${activeUsers} active`} title="Users" tone="violet" value={users.length} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Recent Deposits</h2>
              <p className="mt-1 text-sm text-slate-500">Latest mock payments across supported networks.</p>
            </div>
            <StatusBadge label={`${recentDeposits.length} shown`} tone="gray" value="shown" />
          </div>
          <DataTable
            columns={columns}
            data={recentDeposits}
            emptyMessage="No deposits yet"
            onRowClick={openDeposit}
            mobileRender={(deposit) => (
              <article
                className="cursor-pointer rounded-lg border border-slate-800 bg-slate-900/70 p-4 transition hover:border-cyan-400/30 hover:bg-slate-900"
                onClick={() => openDeposit(deposit)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') openDeposit(deposit);
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">{deposit.user}</p>
                    <p className="mt-1 font-mono text-xs text-slate-500">#{deposit.id}</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-300">{currency(deposit.amount)}</p>
                </div>
                <div className="mt-4 grid gap-2">
                  <div className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2">
                    <span className="text-xs font-semibold uppercase text-slate-500">Network</span>
                    <StatusBadge value={deposit.network} tone="cyan" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2">
                    <span className="text-xs font-semibold uppercase text-slate-500">Status</span>
                    <StatusBadge value={deposit.status} withIcon />
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/60 px-3 py-2">
                    <span className="text-xs font-semibold uppercase text-slate-500">Address</span>
                    <span className="inline-flex items-center gap-2 text-right font-mono text-xs text-slate-300">
                      {shortAddress(deposit.address, 10, 6)}
                      <CopyButton label="address" value={deposit.address} />
                    </span>
                  </div>
                </div>
              </article>
            )}
          />
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
              <RadioTower size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">System Status</h2>
              <p className="text-sm text-slate-500">Mock node health and processing readiness.</p>
            </div>
          </div>
          <div className="space-y-3">
            {networkLabels.map((network) => {
              const networkDeposits = deposits.filter((deposit) => deposit.network === network);
              const networkWallets = wallets.filter((wallet) => wallet.network === network);
              return (
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4" key={network}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{network} Node</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {networkDeposits.length} deposits, {networkWallets.length} wallets
                      </p>
                    </div>
                    <StatusBadge value="online" withIcon />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {networkLabels.map((network) => {
          const networkDeposits = deposits.filter((deposit) => deposit.network === network);
          const latest = networkDeposits[0];
          const volume = networkDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

          return (
            <article className="rounded-lg border border-slate-800 bg-slate-900/70 p-5" key={network}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{network} Activity</h3>
                <TrendingUp className="text-cyan-300" size={18} />
              </div>
              {latest ? (
                <>
                  <p className="mt-4 text-2xl font-bold text-white">{currency(volume)}</p>
                  <p className="mt-1 text-sm text-slate-500">{networkDeposits.length} deposits tracked</p>
                  <div className="mt-4 rounded-lg bg-slate-950/60 p-3">
                    <p className="text-xs text-slate-500">Latest address</p>
                    <p className="mt-1 font-mono text-xs text-slate-300">{shortAddress(latest.address)}</p>
                  </div>
                </>
              ) : (
                <EmptyState title="No network activity" />
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default Dashboard;
