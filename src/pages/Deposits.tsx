import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Layers3, Plus, Radar } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import CopyButton from '../components/CopyButton';
import DataTable, { type Column } from '../components/DataTable';
import { DataCard, DetailCopy, DetailItem, MobileRow } from '../components/DetailBlocks';
import FilterBar from '../components/FilterBar';
import FormModal from '../components/FormModal';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import TableToolbar from '../components/TableToolbar';
import Tabs from '../components/Tabs';
import { useToast } from '../components/toastContext';
import { formatAmount, shortAddress, today } from '../components/ui';
import { type DepositNetwork, type DepositStatus } from '../mock/deposits';
import { type Deposit, useStore } from '../store/useStore';

type SortKey = 'amount' | 'date' | 'status' | '';
type StatusTab = 'all' | DepositStatus;

interface DepositForm {
  user: string;
  amount: string;
  network: DepositNetwork;
  address: string;
  txid: string;
  status: DepositStatus;
  date: string;
}

const emptyForm: DepositForm = {
  user: '',
  amount: '',
  network: 'TRC20',
  address: '',
  txid: '',
  status: 'pending',
  date: today(),
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10';

const Deposits = () => {
  const deposits = useStore((state) => state.deposits);
  const addDeposit = useStore((state) => state.addDeposit);
  const updateDeposit = useStore((state) => state.updateDeposit);
  const deleteDeposit = useStore((state) => state.deleteDeposit);
  const confirmDeposit = useStore((state) => state.confirmDeposit);
  const displayCurrency = useStore((state) => state.appSettings.general.displayCurrency);
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [networkFilter, setNetworkFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Deposit | null>(null);
  const [form, setForm] = useState<DepositForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof DepositForm, string>>>({});
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedId = searchParams.get('selected');
  const selectedDeposit = selectedId ? deposits.find((deposit) => deposit.id === Number(selectedId)) ?? null : null;

  const openDetails = useCallback(
    (deposit: Deposit) => {
      const next = new URLSearchParams(searchParams);
      next.set('selected', String(deposit.id));
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const closeDetails = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('selected');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = deposits.filter((deposit) => {
      const matchesSearch =
        !query ||
        deposit.user.toLowerCase().includes(query) ||
        deposit.txid.toLowerCase().includes(query) ||
        deposit.address.toLowerCase().includes(query);
      const matchesStatus = statusTab === 'all' || deposit.status === statusTab;
      const matchesNetwork = !networkFilter || deposit.network === networkFilter;
      return matchesSearch && matchesStatus && matchesNetwork;
    });

    if (!sortKey) return result;

    return [...result].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return sortDir === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [deposits, networkFilter, search, sortDir, sortKey, statusTab]);

  const statusCounts = {
    all: deposits.length,
    pending: deposits.filter((deposit) => deposit.status === 'pending').length,
    detected: deposits.filter((deposit) => deposit.status === 'detected').length,
    confirming: deposits.filter((deposit) => deposit.status === 'confirming').length,
    completed: deposits.filter((deposit) => deposit.status === 'completed').length,
  };

  const totalAmount = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  const validate = () => {
    const nextErrors: Partial<Record<keyof DepositForm, string>> = {};
    const amount = Number(form.amount);

    if (!form.user.trim()) nextErrors.user = 'User is required.';
    if (!form.amount || Number.isNaN(amount) || amount <= 0) nextErrors.amount = 'Enter an amount greater than 0.';
    if (!form.address.trim() || form.address.trim().length < 20) nextErrors.address = 'Enter a realistic wallet address.';
    if (!form.txid.trim() || form.txid.trim().length < 12) nextErrors.txid = 'Enter a realistic transaction id.';
    if (!form.date) nextErrors.date = 'Created date is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openAdd = useCallback(() => {
    setEditingDeposit(null);
    setForm(emptyForm);
    setErrors({});
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    const create = searchParams.get('new');
    if (create !== '1') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    openAdd();
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    setSearchParams(next, { replace: true });
  }, [openAdd, searchParams, setSearchParams]);

  const openEdit = (deposit: Deposit) => {
    closeDetails();
    setEditingDeposit(deposit);
    setForm({
      user: deposit.user,
      amount: String(deposit.amount),
      network: deposit.network,
      address: deposit.address,
      txid: deposit.txid,
      status: deposit.status,
      date: deposit.date,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDeposit(null);
    setErrors({});
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      user: form.user.trim(),
      amount: Number(form.amount),
      network: form.network,
      address: form.address.trim(),
      txid: form.txid.trim(),
      status: form.status,
      date: form.date,
    };

    if (editingDeposit) {
      updateDeposit(editingDeposit.id, payload);
      showToast('Deposit updated');
    } else {
      addDeposit(payload);
      showToast('Deposit added');
    }

    closeModal();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteDeposit(deleteTarget.id);
    showToast('Deposit deleted');
    setDeleteTarget(null);
  };

  const handleConfirm = (deposit: Deposit) => {
    if (deposit.status === 'completed') {
      showToast('Deposit is already completed', 'info');
      return;
    }
    confirmDeposit(deposit.id);
    showToast('Deposit status advanced');
  };

  const columns: Column<Deposit>[] = [
    { key: 'id', label: 'ID', render: (value) => <span className="font-mono text-xs text-slate-500">#{String(value)}</span> },
    { key: 'user', label: 'User', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (value) => <span className="font-semibold text-emerald-300">{formatAmount(Number(value), displayCurrency)}</span> },
    { key: 'network', label: 'Network', render: (value) => <StatusBadge value={String(value)} tone="cyan" /> },
    { key: 'address', label: 'Address', render: (value) => <span className="font-mono text-xs text-slate-400">{shortAddress(String(value))}</span> },
    { key: 'txid', label: 'TXID', render: (value) => <span className="font-mono text-xs text-slate-400">{shortAddress(String(value), 10, 8)}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (value) => <StatusBadge value={String(value)} withIcon /> },
    { key: 'date', label: 'Created', sortable: true },
  ];

  return (
    <PageContainer>
      <PageHeader
        actions={
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            onClick={openAdd}
            type="button"
          >
            <Plus size={16} />
            Add Deposit
          </button>
        }
        breadcrumbs={['CryptoGate', 'Deposits']}
        description="Create, edit, filter, sort, and simulate status changes for local mock deposits."
        title="Deposits"
      />

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Layers3} subtitle={`${deposits.length} records`} title="Total" tone="cyan" value={formatAmount(totalAmount, displayCurrency)} />
        <StatCard icon={Clock3} subtitle="Awaiting detection" title="Pending" tone="amber" value={statusCounts.pending} />
        <StatCard icon={Radar} subtitle="Payment detected" title="Detected" tone="blue" value={statusCounts.detected} />
        <StatCard icon={Clock3} subtitle="Confirmations in progress" title="Confirming" tone="violet" value={statusCounts.confirming} />
        <StatCard icon={CheckCircle2} subtitle="Fully processed" title="Completed" tone="green" value={statusCounts.completed} />
      </section>

      <Tabs
        ariaLabel="Deposit status"
        items={[
          { value: 'all', label: 'All', count: statusCounts.all },
          { value: 'pending', label: 'Pending', count: statusCounts.pending },
          { value: 'detected', label: 'Detected', count: statusCounts.detected },
          { value: 'confirming', label: 'Confirming', count: statusCounts.confirming },
          { value: 'completed', label: 'Completed', count: statusCounts.completed },
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
        searchPlaceholder="Search by user, TXID, or address..."
        searchValue={search}
      >
        <select
          className="h-10 min-w-40 rounded-lg border border-slate-700 bg-slate-950/80 px-3 text-sm font-medium text-slate-200 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
          onChange={(event) => {
            setSortKey(event.target.value as SortKey);
            setSortDir(event.target.value === 'date' ? 'desc' : 'asc');
          }}
          value={sortKey}
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="status">Sort by Status</option>
        </select>
      </FilterBar>

      <TableToolbar resultCount={filtered.length} title="Deposit Ledger" />
      <DataTable
        columns={columns}
        data={filtered}
        emptyDescription="Try clearing filters or add a new mock deposit."
        emptyMessage="No deposits found"
        onSort={(key, direction) => {
          setSortKey(key as SortKey);
          setSortDir(direction);
        }}
        onRowClick={openDetails}
        sortDirection={sortDir}
        sortKey={sortKey}
        mobileRender={(deposit) => (
          <DataCard onClick={() => openDetails(deposit)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-white">{deposit.user}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">#{deposit.id}</p>
              </div>
              <div className="text-right">
                  <p className="text-lg font-bold text-emerald-300">{formatAmount(deposit.amount, displayCurrency)}</p>
                <StatusBadge value={deposit.status} withIcon />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <MobileRow label="Network" value={<StatusBadge value={deposit.network} tone="cyan" />} />
              <MobileRow
                label="Address"
                value={
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono">{shortAddress(deposit.address, 10, 6)}</span>
                    <CopyButton label="address" value={deposit.address} />
                  </span>
                }
              />
              <MobileRow
                label="TXID"
                value={
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono">{shortAddress(deposit.txid, 10, 8)}</span>
                    <CopyButton label="transaction id" value={deposit.txid} />
                  </span>
                }
              />
              <MobileRow label="Created" value={deposit.date} />
            </div>
            <button className="mt-4 min-h-11 w-full rounded-lg border border-cyan-400/20 text-cyan-200 transition hover:bg-cyan-400/10" type="button">
              View Details
            </button>
          </DataCard>
        )}
      />

      <FormModal
        description="Full deposit details and record actions."
        isOpen={!!selectedDeposit}
        onClose={closeDetails}
        title={selectedDeposit ? `Deposit #${selectedDeposit.id}` : 'Deposit Details'}
        size="lg"
      >
        {selectedDeposit && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem label="User" value={selectedDeposit.user} />
              <DetailItem label="Amount" value={formatAmount(selectedDeposit.amount, displayCurrency)} valueClassName="text-emerald-300" />
              <DetailItem label="Network" value={<StatusBadge value={selectedDeposit.network} tone="cyan" />} />
              <DetailItem label="Status" value={<StatusBadge value={selectedDeposit.status} withIcon />} />
              <DetailItem label="Created" value={selectedDeposit.date} />
              <DetailItem label="ID" value={`#${selectedDeposit.id}`} />
            </div>
            <DetailCopy label="Wallet Address" value={selectedDeposit.address} />
            <DetailCopy label="Transaction ID" value={selectedDeposit.txid} />
            <div className="grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-3">
              <button
                className="min-h-11 rounded-lg border border-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/10 disabled:opacity-40"
                disabled={selectedDeposit.status === 'completed'}
                  onClick={() => {
                    handleConfirm(selectedDeposit);
                    closeDetails();
                  }}
                  type="button"
                >
                Simulate Confirm
              </button>
              <button className="min-h-11 rounded-lg border border-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/10" onClick={() => openEdit(selectedDeposit)} type="button">
                Edit Record
              </button>
              <button
                className="min-h-11 rounded-lg border border-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10"
                  onClick={() => {
                    setDeleteTarget(selectedDeposit);
                    closeDetails();
                  }}
                  type="button"
                >
                Delete Record
              </button>
            </div>
          </div>
        )}
      </FormModal>

      <FormModal
        description="All values are stored in local Zustand state only."
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingDeposit ? 'Edit Deposit' : 'Add Deposit'}
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field error={errors.user} label="User">
              <input className={inputClass} onChange={(event) => setForm({ ...form, user: event.target.value })} placeholder="Customer or merchant name" value={form.user} />
            </Field>
            <Field error={errors.amount} label="Amount">
              <input className={inputClass} min="0" onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" step="0.01" type="number" value={form.amount} />
            </Field>
            <Field label="Network">
              <select className={inputClass} onChange={(event) => setForm({ ...form, network: event.target.value as DepositNetwork })} value={form.network}>
                <option value="TRC20">TRC20</option>
                <option value="ERC20">ERC20</option>
                <option value="BEP20">BEP20</option>
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} onChange={(event) => setForm({ ...form, status: event.target.value as DepositStatus })} value={form.status}>
                <option value="pending">Pending</option>
                <option value="detected">Detected</option>
                <option value="confirming">Confirming</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
          </div>
          <Field error={errors.address} label="Wallet Address">
            <input className={`${inputClass} font-mono`} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Wallet address" value={form.address} />
          </Field>
          <Field error={errors.txid} label="Transaction ID">
            <input className={`${inputClass} font-mono`} onChange={(event) => setForm({ ...form, txid: event.target.value })} placeholder="Transaction hash or ID" value={form.txid} />
          </Field>
          <Field error={errors.date} label="Created Date">
            <input className={inputClass} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" value={form.date} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white" onClick={closeModal} type="button">
              Cancel
            </button>
            <button className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200" type="submit">
              {editingDeposit ? 'Save Changes' : 'Add Deposit'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        confirmLabel="Delete Deposit"
        isOpen={!!deleteTarget}
        message={`Delete deposit #${deleteTarget?.id ?? ''}? This only changes the local mock state, but the action cannot be undone in this session.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
      />
    </PageContainer>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
    {children}
    {error && <span className="mt-1.5 block text-xs font-medium text-rose-300">{error}</span>}
  </label>
);

export default Deposits;
