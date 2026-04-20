import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { type User as UserType } from '../mock/users';
import Table, { type Column } from '../components/Table';
import Filters from '../components/Filters';
import Modal from '../components/Modal';
import { Edit2, Trash2, Plus, Shield, User } from 'lucide-react';

const Users: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user' as UserType['role'], status: 'active' as UserType['status'] });

  const filtered = useMemo(() => {
    let result = [...users];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (roleFilter) result = result.filter((u) => u.role === roleFilter);
    if (statusFilter) result = result.filter((u) => u.status === statusFilter);
    return result;
  }, [users, search, roleFilter, statusFilter]);

  const columns: Column<UserType>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600/30 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-blue-400" />
          </div>
          <div>
            <p className="text-gray-200 text-sm font-medium">{String(v)}</p>
            <p className="text-gray-500 text-xs">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (v) => (
        <div className="flex items-center gap-1.5">
          {v === 'admin' ? <Shield size={13} className="text-blue-400" /> : <User size={13} className="text-gray-400" />}
          <span className={`text-xs font-medium capitalize ${v === 'admin' ? 'text-blue-400' : 'text-gray-400'}`}>{String(v)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${v === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {String(v)}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Joined' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleEdit(row)} className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-400/10 rounded transition-colors">
            <Edit2 size={15} />
          </button>
          <button onClick={() => deleteUser(row.id)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', role: 'user', status: 'active' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, form);
    } else {
      const newId = Math.max(0, ...users.map((u) => u.id)) + 1;
      addUser({ id: newId, ...form, createdAt: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} users found</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add User
        </button>
      </div>

      <Filters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        filters={[
          {
            label: 'All Roles',
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'user', label: 'User' },
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
      />

      <Table columns={columns} data={filtered} emptyMessage="No users found" />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              placeholder="email@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserType['role'] })}
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as UserType['status'] })}
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {editingUser ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
