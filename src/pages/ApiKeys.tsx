import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { KeyRound, Plus, Shield } from 'lucide-react';
import { type ApiKey } from '../mock/apiKeys';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable, { type Column } from '../components/DataTable';
import { DetailCopy, DetailItem, MobileRow } from '../components/DetailBlocks';
import FilterBar from '../components/FilterBar';
import FormModal from '../components/FormModal';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Tabs from '../components/Tabs';
import { useToast } from '../components/toastContext';
import { shortAddress } from '../components/ui';
import { useStore } from '../store/useStore';

type Permission = 'read' | 'write' | 'webhooks';
type StatusTab = 'all' | ApiKey['status'];

interface ApiKeyForm {
  name: string;
  merchant: string;
  permissions: Permission[];
  rateLimit: number;
  status: ApiKey['status'];
}

const emptyForm: ApiKeyForm = {
  name: '',
  merchant: '',
  permissions: ['read'],
  rateLimit: 5000,
  status: 'active',
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10';

const ApiKeys = () => {
  const apiKeys = useStore((state) => state.apiKeys);
  const addApiKey = useStore((state) => state.addApiKey);
  const updateApiKey = useStore((state) => state.updateApiKey);
  const deleteApiKey = useStore((state) => state.deleteApiKey);
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [form, setForm] = useState<ApiKeyForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ApiKeyForm, string>>>({});
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedId = searchParams.get('selected');
  const selectedApiKey = selectedId ? apiKeys.find((apiKey) => apiKey.id === Number(selectedId)) ?? null : null;

  const openDetails = useCallback(
    (apiKey: ApiKey) => {
      const next = new URLSearchParams(searchParams);
      next.set('selected', String(apiKey.id));
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const closeDetails = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('selected');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const openAdd = useCallback(() => {
    setEditingKey(null);
    setForm(emptyForm);
    setErrors({});
    setIsModalOpen(true);
  }, []);

  const openEdit = (apiKey: ApiKey) => {
    closeDetails();
    setEditingKey(apiKey);
    setForm({
      name: apiKey.name,
      merchant: apiKey.merchant,
      permissions: apiKey.permissions as Permission[],
      rateLimit: apiKey.rateLimit,
      status: apiKey.status,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  useEffect(() => {
    const create = searchParams.get('new');
    if (create !== '1') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    openAdd();
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    setSearchParams(next, { replace: true });
  }, [openAdd, searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return apiKeys.filter((apiKey) => {
      const matchesSearch =
        !query ||
        apiKey.name.toLowerCase().includes(query) ||
        apiKey.merchant.toLowerCase().includes(query) ||
        apiKey.key.toLowerCase().includes(query);
      const matchesTab = statusTab === 'all' || apiKey.status === statusTab;
      return matchesSearch && matchesTab;
    });
  }, [apiKeys, search, statusTab]);

  const activeCount = apiKeys.filter((apiKey) => apiKey.status === 'active').length;
  const revokedCount = apiKeys.filter((apiKey) => apiKey.status === 'revoked').length;
  const expiredCount = apiKeys.filter((apiKey) => apiKey.status === 'expired').length;
  const totalRequests = apiKeys.reduce((sum, apiKey) => sum + apiKey.requestsToday, 0);

  const handleRevoke = (apiKey: ApiKey) => {
    updateApiKey(apiKey.id, { status: 'revoked' });
    showToast('API key revoked', 'info');
    closeDetails();
  };

  const handleRotate = (apiKey: ApiKey) => {
    const nextKey = `pk_live_${Math.random().toString(36).slice(2, 18)}...`;
    const nextSecret = `sk_live_${Math.random().toString(36).slice(2, 18)}...`;
    updateApiKey(apiKey.id, { key: nextKey, secret: nextSecret, lastUsed: 'Never', requestsToday: 0 });
    showToast('API key rotated');
    closeDetails();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteApiKey(deleteTarget.id);
    setDeleteTarget(null);
    showToast('API key deleted', 'info');
  };

  const togglePermission = (permission: Permission) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof ApiKeyForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = 'Key name is required.';
    if (!form.merchant.trim()) nextErrors.merchant = 'Merchant is required.';
    if (form.permissions.length === 0) nextErrors.permissions = 'Select at least one permission.';
    if (!Number.isFinite(form.rateLimit) || form.rateLimit < 1) nextErrors.rateLimit = 'Rate limit must be at least 1.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const newId = Math.max(0, ...apiKeys.map((apiKey) => apiKey.id)) + 1;
    const now = new Date().toISOString().split('T')[0];
    const expiresAt = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];

    if (editingKey) {
      updateApiKey(editingKey.id, {
        name: form.name.trim(),
        merchant: form.merchant.trim(),
        permissions: form.permissions,
        rateLimit: form.rateLimit,
        status: form.status,
      });
      showToast('API key updated');
      setEditingKey(null);
      setIsModalOpen(false);
      return;
    }

    addApiKey({
      id: newId,
      name: form.name.trim(),
      key: `pk_live_${Math.random().toString(36).slice(2, 18)}...`,
      secret: `sk_live_${Math.random().toString(36).slice(2, 18)}...`,
      merchant: form.merchant.trim(),
      permissions: form.permissions,
      status: form.status,
      lastUsed: 'Never',
      requestsToday: 0,
      rateLimit: form.rateLimit,
      createdAt: now,
      expiresAt,
    });
    showToast('API key generated');
    setIsModalOpen(false);
  };

  const columns: Column<ApiKey>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (value, row) => (
        <div>
          <p className="text-sm font-semibold text-white">{String(value)}</p>
          <p className="text-xs text-slate-500">{row.merchant}</p>
        </div>
      ),
    },
    { key: 'key', label: 'API Key', render: (value) => <span className="font-mono text-xs text-slate-400">{shortAddress(String(value), 14, 6)}</span> },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions.map((permission) => (
            <StatusBadge key={permission} value={permission} />
          ))}
        </div>
      ),
    },
    {
      key: 'requestsToday',
      label: 'Requests',
      render: (_, row) => (
        <span className="text-sm text-slate-300">
          {row.requestsToday.toLocaleString()} / {row.rateLimit.toLocaleString()}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (value) => <StatusBadge value={String(value)} /> },
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
            Generate Key
          </button>
        }
        breadcrumbs={['CryptoGate', 'API Keys']}
        description="Manage mock API access keys and inspect details before taking actions."
        title="API Keys"
      />

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={KeyRound} subtitle="Total records" title="API Keys" tone="cyan" value={apiKeys.length} />
        <StatCard icon={Shield} subtitle={`${revokedCount} revoked`} title="Active Keys" tone="green" value={activeCount} />
        <StatCard icon={KeyRound} subtitle="Mock requests today" title="Requests" tone="blue" value={totalRequests.toLocaleString()} />
      </section>

      <Tabs
        ariaLabel="API key status"
        items={[
          { value: 'all', label: 'All', count: apiKeys.length },
          { value: 'active', label: 'Active', count: activeCount },
          { value: 'revoked', label: 'Revoked', count: revokedCount },
          { value: 'expired', label: 'Expired', count: expiredCount },
        ]}
        onChange={(value) => setStatusTab(value as StatusTab)}
        value={statusTab}
      />

      <FilterBar
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, merchant, or key..."
        searchValue={search}
      />

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No API keys found"
        onRowClick={openDetails}
        mobileRender={(apiKey) => (
          <article
            className="cursor-pointer rounded-lg border border-slate-800 bg-slate-900/70 p-4 transition hover:border-cyan-400/30 hover:bg-slate-900"
            onClick={() => openDetails(apiKey)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') openDetails(apiKey);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-white">{apiKey.name}</p>
                <p className="mt-1 truncate text-sm text-slate-500">{apiKey.merchant}</p>
              </div>
              <StatusBadge value={apiKey.status} />
            </div>
            <div className="mt-4 space-y-3">
              <MobileRow label="API Key" value={<span className="font-mono">{shortAddress(apiKey.key, 12, 6)}</span>} />
              <MobileRow label="Requests" value={`${apiKey.requestsToday.toLocaleString()} / ${apiKey.rateLimit.toLocaleString()}`} />
            </div>
          </article>
        )}
      />

      <FormModal isOpen={!!selectedApiKey} onClose={closeDetails} title={selectedApiKey?.name ?? 'API Key Details'} size="lg">
        {selectedApiKey && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem label="Merchant" value={selectedApiKey.merchant} />
              <DetailItem label="Status" value={<StatusBadge value={selectedApiKey.status} />} />
              <DetailItem label="Created" value={selectedApiKey.createdAt} />
              <DetailItem label="Expires" value={selectedApiKey.expiresAt} />
              <DetailItem label="Last Used" value={selectedApiKey.lastUsed} />
              <DetailItem label="Requests Today" value={`${selectedApiKey.requestsToday.toLocaleString()} / ${selectedApiKey.rateLimit.toLocaleString()}`} />
            </div>
            <DetailCopy label="API Key" value={selectedApiKey.key} />
            <DetailCopy label="Secret" value={selectedApiKey.secret} />
            <div className="flex flex-wrap gap-2">
              {selectedApiKey.permissions.map((permission) => (
                <StatusBadge key={permission} value={permission} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-2">
              <button
                className="min-h-11 rounded-lg border border-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/10"
                onClick={() => openEdit(selectedApiKey)}
                type="button"
              >
                Edit Key
              </button>
              <button
                className="min-h-11 rounded-lg border border-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10 disabled:opacity-40"
                disabled={selectedApiKey.status !== 'active'}
                onClick={() => handleRotate(selectedApiKey)}
                type="button"
              >
                Rotate Key
              </button>
              <button
                className="min-h-11 rounded-lg border border-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/10 disabled:opacity-40"
                disabled={selectedApiKey.status !== 'active'}
                onClick={() => handleRevoke(selectedApiKey)}
                type="button"
              >
                Revoke Key
              </button>
              <button
                className="min-h-11 rounded-lg border border-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10"
                onClick={() => {
                  setDeleteTarget(selectedApiKey);
                  closeDetails();
                }}
                type="button"
              >
                Delete Key
              </button>
            </div>
          </div>
        )}
      </FormModal>

      <FormModal
        description={editingKey ? 'Update metadata and permissions for the selected key.' : 'Generate a new mock API key for this session.'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingKey(null);
        }}
        title={editingKey ? 'Edit API Key' : 'Generate API Key'}
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field error={errors.name} label="Key Name">
            <input className={inputClass} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Production Key" value={form.name} />
          </Field>
          <Field error={errors.merchant} label="Merchant">
            <input className={inputClass} onChange={(event) => setForm({ ...form, merchant: event.target.value })} placeholder="Merchant name" value={form.merchant} />
          </Field>
          <Field label="Status">
            <select className={inputClass} onChange={(event) => setForm({ ...form, status: event.target.value as ApiKey['status'] })} value={form.status}>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>
          </Field>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">Permissions</p>
            <div className="flex flex-wrap gap-2">
              {(['read', 'write', 'webhooks'] as const).map((permission) => (
                <button
                  className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    form.permissions.includes(permission)
                      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200'
                      : 'border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                  key={permission}
                  onClick={() => togglePermission(permission)}
                  type="button"
                >
                  <Shield size={14} />
                  {permission}
                </button>
              ))}
            </div>
            {errors.permissions && <p className="mt-2 text-xs font-semibold text-rose-300">{errors.permissions}</p>}
          </div>
          <Field error={errors.rateLimit} label="Rate Limit">
            <input className={inputClass} min={1} onChange={(event) => setForm({ ...form, rateLimit: Number(event.target.value) })} type="number" value={form.rateLimit} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              onClick={() => {
                setIsModalOpen(false);
                setEditingKey(null);
              }}
              type="button"
            >
              Cancel
            </button>
            <button className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200" type="submit">
              {editingKey ? 'Save Changes' : 'Generate'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        confirmLabel="Delete Key"
        isOpen={!!deleteTarget}
        message={`Delete ${deleteTarget?.name ?? 'this API key'}? This only changes local mock state for this session.`}
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

export default ApiKeys;
