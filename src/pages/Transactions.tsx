import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, DollarSign, Receipt, TrendingUp } from 'lucide-react';
import DataTable, { type Column } from '../components/DataTable';
import { DetailCopy, DetailItem, MobileRow } from '../components/DetailBlocks';
import FilterBar from '../components/FilterBar';
import FormModal from '../components/FormModal';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Tabs from '../components/Tabs';
import { shortAddress } from '../components/ui';
import { type Transaction } from '../mock/transactions';
import { useStore } from '../store/useStore';

type StatusTab = 'all' | Transaction['status'];
type SortKey = 'createdAt' | 'amount' | 'status' | '';

const Transactions = () => {
  const transactions = useStore((state) => state.transactions);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [networkFilter, setNetworkFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const selectedId = searchParams.get('selected');
  const selectedTx = selectedId ? transactions.find((tx) => tx.id === Number(selectedId)) ?? null : null;

  const openTx = (tx: Transaction) => {
    const next = new URLSearchParams(searchParams);
    next.set('selected', String(tx.id));
    setSearchParams(next);
  };

  const closeTx = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('selected');
    setSearchParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const byStatus = (status: Transaction['status']) => transactions.filter((tx) => tx.status === status).length;
    return {
      all: transactions.length,
      pending: byStatus('pending'),
      processing: byStatus('processing'),
      confirmed: byStatus('confirmed'),
      completed: byStatus('completed'),
      failed: byStatus('failed'),
      expired: byStatus('expired'),
    };
  }, [transactions]);

  const totalVolume = useMemo(
    () => transactions.filter((tx) => tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0),
    [transactions],
  );
  const totalFees = useMemo(
    () => transactions.filter((tx) => tx.status === 'completed').reduce((sum, tx) => sum + tx.fee, 0),
    [transactions],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = transactions.filter((tx) => {
      const matchesSearch =
        !query ||
        tx.orderId.toLowerCase().includes(query) ||
        tx.merchant.toLowerCase().includes(query) ||
        tx.txHash.toLowerCase().includes(query);
      const matchesTab = statusTab === 'all' || tx.status === statusTab;
      const matchesNetwork = !networkFilter || tx.network === networkFilter;
      return matchesSearch && matchesTab && matchesNetwork;
    });

    if (!sortKey) return result;

    return [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
  }, [networkFilter, search, sortDir, sortKey, statusTab, transactions]);

  const columns: Column<Transaction>[] = [
    { key: 'orderId', label: 'Order', sortable: true, render: (value) => <span className="font-mono text-xs text-cyan-200">{String(value)}</span> },
    { key: 'merchant', label: 'Merchant', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value, row) => (
        <span className="font-semibold text-emerald-300">
          ${Number(value).toFixed(2)} <span className="text-xs text-slate-500">{row.currency}</span>
        </span>
      ),
    },
    { key: 'network', label: 'Network', render: (value) => <StatusBadge value={String(value)} tone="cyan" /> },
    { key: 'status', label: 'Status', sortable: true, render: (value) => <StatusBadge value={String(value)} withIcon /> },
    { key: 'createdAt', label: 'Created', sortable: true, render: (value) => <span className="text-xs text-slate-400">{String(value).split(' ')[0]}</span> },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        breadcrumbs={['CryptoGate', 'Transactions']}
        description="Review mock payment transactions and inspect full metadata in a single-click details view."
        title="Transactions"
      />

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CreditCard} subtitle="Mock transactions" title="Total" tone="cyan" value={transactions.length} />
        <StatCard icon={DollarSign} subtitle="Completed only" title="Volume" tone="green" value={`$${totalVolume.toLocaleString()}`} />
        <StatCard icon={Receipt} subtitle="Completed only" title="Fees" tone="blue" value={`$${totalFees.toFixed(2)}`} />
        <StatCard icon={TrendingUp} subtitle="Completed count" title="Completed" tone="violet" value={counts.completed} />
      </section>

      <Tabs
        ariaLabel="Transaction status"
        items={[
          { value: 'all', label: 'All', count: counts.all },
          { value: 'pending', label: 'Pending', count: counts.pending },
          { value: 'processing', label: 'Processing', count: counts.processing },
          { value: 'confirmed', label: 'Confirmed', count: counts.confirmed },
          { value: 'completed', label: 'Completed', count: counts.completed },
          { value: 'failed', label: 'Failed', count: counts.failed },
          { value: 'expired', label: 'Expired', count: counts.expired },
        ]}
        onChange={(value) => setStatusTab(value as StatusTab)}
        value={statusTab}
      />

      <FilterBar
        filters={[
          {
            label: 'All Networks',
            value: networkFilter,
            onChange: setNetworkFilter,
            options: [
              { value: 'TRC20', label: 'TRC20' },
              { value: 'ERC20', label: 'ERC20' },
              { value: 'BEP20', label: 'BEP20' },
            ],
          },
        ]}
        onSearchChange={setSearch}
        searchPlaceholder="Search by order ID, merchant, or tx hash..."
        searchValue={search}
      >
        <select
          className="h-10 min-w-40 rounded-lg border border-slate-700 bg-slate-950/80 px-3 text-sm font-medium text-slate-200 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
          onChange={(event) => {
            setSortKey(event.target.value as SortKey);
            setSortDir(event.target.value === 'createdAt' ? 'desc' : 'asc');
          }}
          value={sortKey}
        >
          <option value="createdAt">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="status">Sort by Status</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={filtered}
        emptyDescription="Try clearing filters or changing the status tab."
        emptyMessage="No transactions found"
        onRowClick={openTx}
        sortDirection={sortDir}
        sortKey={sortKey}
        mobileRender={(transaction) => (
          <article
            className="cursor-pointer rounded-lg border border-slate-800 bg-slate-900/70 p-4 transition hover:border-cyan-400/30 hover:bg-slate-900"
            onClick={() => openTx(transaction)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') openTx(transaction);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-cyan-200">{transaction.orderId}</p>
                <p className="mt-1 truncate text-sm text-slate-500">{transaction.merchant}</p>
              </div>
              <p className="text-lg font-bold text-emerald-300">${transaction.amount.toFixed(2)}</p>
            </div>
            <div className="mt-4 grid gap-2">
              <MobileRow label="Network" value={<StatusBadge value={transaction.network} tone="cyan" />} />
              <MobileRow label="Status" value={<StatusBadge value={transaction.status} withIcon />} />
              <MobileRow label="TX Hash" value={<span className="font-mono">{shortAddress(transaction.txHash, 10, 8)}</span>} />
              <MobileRow label="Date" value={transaction.createdAt.split(' ')[0]} />
            </div>
          </article>
        )}
      />

      <FormModal
        description="Full transaction details."
        isOpen={!!selectedTx}
        onClose={closeTx}
        title={selectedTx ? `Transaction ${selectedTx.orderId}` : 'Transaction Details'}
        size="xl"
      >
        {selectedTx && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem label="Order ID" value={selectedTx.orderId} />
              <DetailItem label="Merchant" value={selectedTx.merchant} />
              <DetailItem label="Amount" value={`$${selectedTx.amount.toFixed(2)} ${selectedTx.currency}`} valueClassName="text-emerald-300" />
              <DetailItem label="Fee" value={`$${selectedTx.fee.toFixed(2)}`} />
              <DetailItem label="Network" value={<StatusBadge value={selectedTx.network} tone="cyan" />} />
              <DetailItem label="Status" value={<StatusBadge value={selectedTx.status} withIcon />} />
              <DetailItem label="Confirmations" value={`${selectedTx.confirmations} / ${selectedTx.requiredConfirmations}`} />
              <DetailItem label="Created" value={selectedTx.createdAt} />
              <DetailItem label="Updated" value={selectedTx.updatedAt} />
            </div>

            <DetailCopy label="From Address" value={selectedTx.fromAddress} />
            <DetailCopy label="To Address" value={selectedTx.toAddress} />
            <DetailCopy label="TX Hash" value={selectedTx.txHash} />
            <DetailCopy label="Callback URL" value={selectedTx.callbackUrl} />
          </div>
        )}
      </FormModal>
    </div>
  );
};

export default Transactions;
