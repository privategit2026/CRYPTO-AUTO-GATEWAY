import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Shield, UserCheck, UserRound, UsersRound } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable, { type Column } from '../components/DataTable';
import { DataCard, DetailItem, MobileRow } from '../components/DetailBlocks';
import FilterBar from '../components/FilterBar';
import FormModal from '../components/FormModal';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import TableToolbar from '../components/TableToolbar';
import Tabs from '../components/Tabs';
import { useToast } from '../components/toastContext';
import { today } from '../components/ui';
import { type UserRole, type UserStatus } from '../mock/users';
import { type User, useStore } from '../store/useStore';

type UserTab = 'all' | UserRole | UserStatus;
type SortKey = 'createdAt' | 'name' | 'role' | 'status' | '';

interface UserForm {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

const emptyForm: UserForm = {
  name: '',
  email: '',
  role: 'viewer',
  status: 'active',
  createdAt: today(),
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10';

const Users = () => {
  const users = useStore((state) => state.users);
  const addUser = useStore((state) => state.addUser);
  const updateUser = useStore((state) => state.updateUser);
  const deleteUser = useStore((state) => state.deleteUser);
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<UserTab>('all');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof UserForm, string>>>({});
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedId = searchParams.get('selected');
  const selectedUser = selectedId ? users.find((user) => user.id === Number(selectedId)) ?? null : null;

  const openDetails = useCallback(
    (user: User) => {
      const next = new URLSearchParams(searchParams);
      next.set('selected', String(user.id));
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
    const result = users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      const matchesTab =
        activeTab === 'all' ||
        user.role === activeTab ||
        user.status === activeTab;
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      return matchesSearch && matchesTab && matchesRole && matchesStatus;
    });

    if (!sortKey) return result;

    return [...result].sort((a, b) =>
      sortDir === 'asc'
        ? String(a[sortKey]).localeCompare(String(b[sortKey]))
        : String(b[sortKey]).localeCompare(String(a[sortKey])),
    );
  }, [activeTab, roleFilter, search, sortDir, sortKey, statusFilter, users]);

  const counts = {
    all: users.length,
    admin: users.filter((user) => user.role === 'admin').length,
    manager: users.filter((user) => user.role === 'manager').length,
    viewer: users.filter((user) => user.role === 'viewer').length,
    active: users.filter((user) => user.status === 'active').length,
    inactive: users.filter((user) => user.status === 'inactive').length,
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof UserForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!form.createdAt) nextErrors.createdAt = 'Created date is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openAdd = useCallback(() => {
    setEditingUser(null);
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

  const openEdit = (user: User) => {
    closeDetails();
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setErrors({});
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      status: form.status,
      createdAt: form.createdAt,
    };

    if (editingUser) {
      updateUser(editingUser.id, payload);
      showToast('User updated');
    } else {
      addUser(payload);
      showToast('User added');
    }
    closeModal();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id);
    showToast('User deleted');
    setDeleteTarget(null);
  };

  const columns: Column<User>[] = [
    { key: 'id', label: 'ID', render: (value) => <span className="font-mono text-xs text-slate-500">#{String(value)}</span> },
    {
      key: 'name',
      label: 'Name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-cyan-200">
            <UserRound size={16} />
          </div>
          <div>
            <p className="font-semibold text-white">{String(value)}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <span className="inline-flex items-center gap-2">
          {value === 'admin' && <Shield size={14} className="text-cyan-300" />}
          <StatusBadge value={String(value)} />
        </span>
      ),
    },
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
            Add User
          </button>
        }
        breadcrumbs={['CryptoGate', 'Users']}
        description="Manage mock admin, manager, and viewer records with responsive role and status controls."
        title="Users"
      />

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={UsersRound} subtitle="Mock accounts" title="Total Users" tone="cyan" value={counts.all} />
        <StatCard icon={Shield} subtitle="Full access" title="Admins" tone="blue" value={counts.admin} />
        <StatCard icon={UserCheck} subtitle="Operational users" title="Managers" tone="violet" value={counts.manager} />
        <StatCard icon={UserRound} subtitle="Read-only users" title="Viewers" tone="amber" value={counts.viewer} />
        <StatCard icon={UserCheck} subtitle={`${counts.inactive} inactive`} title="Active" tone="green" value={counts.active} />
      </section>

      <Tabs
        ariaLabel="User role and status"
        items={[
          { value: 'all', label: 'All', count: counts.all },
          { value: 'admin', label: 'Admin', count: counts.admin },
          { value: 'manager', label: 'Manager', count: counts.manager },
          { value: 'viewer', label: 'Viewer', count: counts.viewer },
          { value: 'active', label: 'Active', count: counts.active },
          { value: 'inactive', label: 'Inactive', count: counts.inactive },
        ]}
        onChange={(value) => setActiveTab(value as UserTab)}
        value={activeTab}
      />

      <FilterBar
        filters={[
          {
            label: 'All Roles',
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'manager', label: 'Manager' },
              { value: 'viewer', label: 'Viewer' },
            ],
          },
          {
            label: 'All Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        ]}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
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
          <option value="name">Sort by Name</option>
          <option value="role">Sort by Role</option>
          <option value="status">Sort by Status</option>
        </select>
      </FilterBar>

      <TableToolbar resultCount={filtered.length} title="User Directory" />
      <DataTable
        columns={columns}
        data={filtered}
        emptyDescription="Try clearing filters or add a user."
        emptyMessage="No users found"
        onRowClick={openDetails}
        mobileRender={(user) => (
          <DataCard onClick={() => openDetails(user)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-cyan-200">
                  <UserRound size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-white">{user.name}</p>
                  <p className="truncate text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <span className="font-mono text-xs text-slate-500">#{user.id}</span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <MobileRow label="Role" value={<StatusBadge value={user.role} />} />
              <MobileRow label="Status" value={<StatusBadge value={user.status} withIcon />} />
              <MobileRow label="Created" value={user.createdAt} />
            </div>
            <button className="mt-4 min-h-11 w-full rounded-lg border border-cyan-400/20 text-cyan-200 transition hover:bg-cyan-400/10" type="button">
              View Details
            </button>
          </DataCard>
        )}
      />

      <FormModal
        description="Full user details and record actions."
        isOpen={!!selectedUser}
        onClose={closeDetails}
        title={selectedUser ? selectedUser.name : 'User Details'}
      >
        {selectedUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-cyan-200">
                <UserRound size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-white">{selectedUser.name}</p>
                <p className="truncate text-sm text-slate-500">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem label="Role" value={<StatusBadge value={selectedUser.role} />} />
              <DetailItem label="Status" value={<StatusBadge value={selectedUser.status} withIcon />} />
              <DetailItem label="Created" value={selectedUser.createdAt} />
              <DetailItem label="ID" value={`#${selectedUser.id}`} />
            </div>
            <div className="grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-2">
              <button className="min-h-11 rounded-lg border border-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/10" onClick={() => openEdit(selectedUser)} type="button">
                Edit Record
              </button>
              <button
                className="min-h-11 rounded-lg border border-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10"
                  onClick={() => {
                    setDeleteTarget(selectedUser);
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
        description="Users are mock records stored in memory for the current session."
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? 'Edit User' : 'Add User'}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field error={errors.name} label="Full Name">
            <input className={inputClass} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" value={form.name} />
          </Field>
          <Field error={errors.email} label="Email">
            <input className={inputClass} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" type="email" value={form.email} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Role">
              <select className={inputClass} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })} value={form.role}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} onChange={(event) => setForm({ ...form, status: event.target.value as UserStatus })} value={form.status}>
                <option value="active">Active</option>
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
              {editingUser ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        confirmLabel="Delete User"
        isOpen={!!deleteTarget}
        message={`Delete ${deleteTarget?.name ?? 'this user'}? This only changes the local mock state for this session.`}
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

export default Users;
