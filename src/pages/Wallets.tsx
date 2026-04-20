import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Power, WalletCards } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import CopyButton from '../components/CopyButton';
import DataTable, { type Column } from '../components/DataTable';
import { DataCard, DetailCopy, DetailItem, MobileRow } from '../components/DetailBlocks';
import FilterBar from '../components/FilterBar';
import FormModal from '../components/FormModal';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import TableToolbar from '../components/TableToolbar';
import Tabs from '../components/Tabs';
import { useToast } from '../components/toastContext';
import { shortAddress, today } from '../components/ui';
import { type DepositNetwork } from '../mock/deposits';
import { type WalletStatus } from '../mock/wallets';
import { type Wallet, useStore } from '../store/useStore';

type WalletTab = 'all' | WalletStatus;
type SortKey = 'createdAt' | 'status' | 'user' | '';

interface WalletForm {
  address: string;
  user: string;
  network: DepositNetwork;
  status: WalletStatus;
  createdAt: string;
}

const emptyForm: WalletForm = {
  address: '',
  user: '',
  network: 'TRC20',
  status: 'active',
  createdAt: today(),
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10';

const Wallets = () => {
  const wallets = useStore((state) => state.wallets);
  const addWallet = useStore((state) => state.addWallet);
  const updateWallet = useStore((state) => state.updateWallet);
  const deleteWallet = useStore((state) => state.deleteWallet);
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<WalletTab>('all');
  const [networkFilter, setNetworkFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Wallet | null>(null);
  const [form, setForm] = useState<WalletForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof WalletForm, string>>>({});
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedId = searchParams.get('selected');
  const selectedWallet = selectedId ? wallets.find((wallet) => wallet.id === Number(selectedId)) ?? null : null;

  const openDetails = useCallback(
    (wallet: Wallet) => {
      const next = new URLSearchParams(searchParams);
      next.set('selected', String(wallet.id));
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
    const result = wallets.filter((wallet) => {
      const matchesSearch =
        !query ||
        wallet.address.toLowerCase().includes(query) ||
        wallet.user.toLowerCase().includes(query);
      const matchesStatus = statusTab === 'all' || wallet.status === statusTab;
      const matchesNetwork = !networkFilter || wallet.network === networkFilter;
      return matchesSearch && matchesStatus && matchesNetwork;
    });

    if (!sortKey) return result;

    return [...result].sort((a, b) =>
      sortDir === 'asc'
        ? String(a[sortKey]).localeCompare(String(b[sortKey]))
        : String(b[sortKey]).localeCompare(String(a[sortKey])),
    );
  }, [networkFilter, search, sortDir, sortKey, statusTab, wallets]);

  const statusCounts = {
    all: wallets.length,
    active: wallets.filter((wallet) => wallet.status === 'active').length,
    used: wallets.filter((wallet) => wallet.status === 'used').length,
    inactive: wallets.filter((wallet) => wallet.status === 'inactive').length,
  };

  const networkCount = new Set(wallets.map((wallet) => wallet.network)).size;

  const validate = () => {
    const nextErrors: Partial<Record<keyof WalletForm, string>> = {};
    if (!form.address.trim() || form.address.trim().length < 20) nextErrors.address = 'Enter a realistic wallet address.';
    if (!form.user.trim()) nextErrors.user = 'Assigned user is required.';
    if (!form.createdAt) nextErrors.createdAt = 'Created date is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openAdd = useCallback(() => {
    setEditingWallet(null);
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

  const openEdit = (wallet: Wallet) => {
    closeDetails();
    setEditingWallet(wallet);
    setForm({
      address: wallet.address,
      user: wallet.user,
      network: wallet.network,
      status: wallet.status,
      createdAt: wallet.createdAt,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWallet(null);
    setErrors({});
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      address: form.address.trim(),
      user: form.user.trim(),
      network: form.network,
      status: form.status,
      createdAt: form.createdAt,
    };

    if (editingWallet) {
      updateWallet(editingWallet.id, payload);
      showToast('Wallet updated');
    } else {
      addWallet(payload);
      showToast('Wallet added');
    }
    closeModal();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteWallet(deleteTarget.id);
    showToast('Wallet deleted');
    setDeleteTarget(null);
  };

  const columns: Column<Wallet>[] = [
    { key: 'id', label: 'ID', render: (value) => <span className="font-mono text-xs text-slate-500">#{String(value)}</span> },
    { key: 'address', label: 'Address', render: (value) => <span className="font-mono text-xs text-slate-300">{shortAddress(String(value), 10, 8)}</span> },
    { key: 'network', label: 'Network', render: (value) => <StatusBadge value={String(value)} tone="cyan" /> },
    { key: 'user', label: 'Assigned User' },
    { key: 'status', label: 'Status', render: (value) => <StatusBadge value={String(value)} withIcon /> },
    { key: 'createdAt', label: 'Created' },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        actions={
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            onClick={openAdd}
            type="button"
          >
            <Plus size={16} />
            Add Wallet
          </button>
        }
        breadcrumbs={['CryptoGate', 'Wallets']}
        description="Manage reusable mock wallet assignments across supported payment networks."
        title="Wallets"
      />

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={WalletCards} subtitle={`${networkCount} networks`} title="Total Wallets" tone="cyan" value={wallets.length} />
        <StatCard icon={Power} subtitle="Ready for assignment" title="Active" tone="green" value={statusCounts.active} />
        <StatCard icon={WalletCards} subtitle="Already used" title="Used" tone="amber" value={statusCounts.used} />
        <StatCard icon={Power} subtitle="Disabled records" title="Disabled" tone="rose" value={statusCounts.inactive} />
      </section>

      <Tabs
        ariaLabel="Wallet status"
        items={[
          { value: 'all', label: 'All', count: statusCounts.all },
          { value: 'active', label: 'Active', count: statusCounts.active },
          { value: 'used', label: 'Used', count: statusCounts.used },
          { value: 'inactive', label: 'Disabled', count: statusCounts.inactive },
        ]}
        onChange={(value) => setStatusTab(value as WalletTab)}
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
        searchPlaceholder="Search by address or assigned user..."
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
          <option value="user">Sort by User</option>
          <option value="status">Sort by Status</option>
        </select>
      </FilterBar>

      <TableToolbar resultCount={filtered.length} title="Wallet Inventory" />
      <DataTable
        columns={columns}
        data={filtered}
        emptyDescription="Try clearing filters or add a wallet."
        emptyMessage="No wallets found"
        onRowClick={openDetails}
        mobileRender={(wallet) => (
          <DataCard onClick={() => openDetails(wallet)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-white">{shortAddress(wallet.address, 12, 8)}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">#{wallet.id}</p>
              </div>
              <CopyButton label="wallet address" value={wallet.address} />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <MobileRow label="Network" value={<StatusBadge value={wallet.network} tone="cyan" />} />
              <MobileRow label="Assigned User" value={wallet.user} />
              <MobileRow label="Status" value={<StatusBadge value={wallet.status} withIcon />} />
              <MobileRow label="Created" value={wallet.createdAt} />
            </div>
            <button className="mt-4 min-h-11 w-full rounded-lg border border-cyan-400/20 text-cyan-200 transition hover:bg-cyan-400/10" type="button">
              View Details
            </button>
          </DataCard>
        )}
      />

      <FormModal
        description="Full wallet details and record actions."
        isOpen={!!selectedWallet}
        onClose={closeDetails}
        title={selectedWallet ? `Wallet #${selectedWallet.id}` : 'Wallet Details'}
      >
        {selectedWallet && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem label="Assigned User" value={selectedWallet.user} />
              <DetailItem label="Network" value={<StatusBadge value={selectedWallet.network} tone="cyan" />} />
              <DetailItem label="Status" value={<StatusBadge value={selectedWallet.status} withIcon />} />
              <DetailItem label="Created" value={selectedWallet.createdAt} />
              <DetailItem label="ID" value={`#${selectedWallet.id}`} />
            </div>
            <DetailCopy label="Wallet Address" value={selectedWallet.address} />
            <div className="grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-2">
              <button className="min-h-11 rounded-lg border border-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/10" onClick={() => openEdit(selectedWallet)} type="button">
                Edit Record
              </button>
              <button
                className="min-h-11 rounded-lg border border-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10"
                  onClick={() => {
                    setDeleteTarget(selectedWallet);
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
        description="Wallets are mock records and update local state instantly."
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingWallet ? 'Edit Wallet' : 'Add Wallet'}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field error={errors.address} label="Wallet Address">
            <input className={`${inputClass} font-mono`} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Wallet address" value={form.address} />
          </Field>
          <Field error={errors.user} label="Assigned User">
            <input className={inputClass} onChange={(event) => setForm({ ...form, user: event.target.value })} placeholder="Assigned user" value={form.user} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Network">
              <select className={inputClass} onChange={(event) => setForm({ ...form, network: event.target.value as DepositNetwork })} value={form.network}>
                <option value="TRC20">TRC20</option>
                <option value="ERC20">ERC20</option>
                <option value="BEP20">BEP20</option>
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} onChange={(event) => setForm({ ...form, status: event.target.value as WalletStatus })} value={form.status}>
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
          <Field error={errors.createdAt} label="Created Date">
            <input className={inputClass} onChange={(event) => setForm({ ...form, createdAt: event.target.value })} type="date" value={form.createdAt} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white" onClick={closeModal} type="button">
              Cancel
            </button>
            <button className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200" type="submit">
              {editingWallet ? 'Save Changes' : 'Add Wallet'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        confirmLabel="Delete Wallet"
        isOpen={!!deleteTarget}
        message={`Delete wallet #${deleteTarget?.id ?? ''}? This only changes the local mock state for this session.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
      />
    </div>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
    {children}
    {error && <span className="mt-1.5 block text-xs font-medium text-rose-300">{error}</span>}
  </label>
);

export default Wallets;
