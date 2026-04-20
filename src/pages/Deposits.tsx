import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { type Deposit } from '../mock/deposits';
import Table, { type Column } from '../components/Table';
import Filters from '../components/Filters';
import Modal from '../components/Modal';
import { StatusBadge } from './Dashboard';
import { Edit2, Trash2, CheckCircle, Plus } from 'lucide-react';

const Deposits: React.FC = () => {
  const { deposits, addDeposit, updateDeposit, deleteDeposit } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [form, setForm] = useState({ user: '', amount: '', network: 'TRC20', address: '', txid: '', status: 'pending' as Deposit['status'] });

  const filtered = useMemo(() => {
    let result = [...deposits];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) =>
        d.user.toLowerCase().includes(q) || d.txid.toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter((d) => d.status === statusFilter);
    if (networkFilter) result = result.filter((d) => d.network === networkFilter);
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[sortKey];
        const bVal = (b as unknown as Record<string, unknown>)[sortKey];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return result;
  }, [deposits, search, statusFilter, networkFilter, sortKey, sortDir]);

  const columns: Column<Deposit>[] = [
    { key: 'user', label: 'User', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (v) => <span className="text-green-400 font-medium">${Number(v).toLocaleString()}</span> },
    { key: 'network', label: 'Network', render: (v) => <span className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded text-xs font-medium">{String(v)}</span> },
    { key: 'address', label: 'Address', render: (v) => <span className="font-mono text-xs text-gray-400 max-w-32 truncate block">{String(v)}</span> },
    { key: 'txid', label: 'TXID', render: (v) => <span className="font-mono text-xs text-gray-400 max-w-28 truncate block">{String(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleSimConfirm(row)} className="text-green-400 hover:text-green-300 p-1 hover:bg-green-400/10 rounded transition-colors" title="Advance Status">
            <CheckCircle size={15} />
          </button>
          <button onClick={() => handleEdit(row)} className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-400/10 rounded transition-colors" title="Edit">
            <Edit2 size={15} />
          </button>
          <button onClick={() => deleteDeposit(row.id)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded transition-colors" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const handleSimConfirm = (deposit: Deposit) => {
    const nextStatus: Record<string, Deposit['status']> = {
      pending: 'detected',
      detected: 'confirming',
      detecting: 'confirming',
      confirming: 'completed',
    };
    const next = nextStatus[deposit.status];
    if (next) updateDeposit(deposit.id, { status: next });
  };

  const handleEdit = (deposit: Deposit) => {
    setEditingDeposit(deposit);
    setForm({ user: deposit.user, amount: String(deposit.amount), network: deposit.network, address: deposit.address, txid: deposit.txid, status: deposit.status });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDeposit(null);
    setForm({ user: '', amount: '', network: 'TRC20', address: '', txid: '', status: 'pending' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeposit) {
      updateDeposit(editingDeposit.id, { ...form, amount: Number(form.amount) });
    } else {
      const newId = Math.max(0, ...deposits.map((d) => d.id)) + 1;
      addDeposit({ id: newId, ...form, amount: Number(form.amount), date: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Deposits</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} transactions found</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Deposit
        </button>
      </div>

      <Filters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by user or TXID..."
        filters={[
          {
            label: 'All Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'detected', label: 'Detected' },
              { value: 'confirming', label: 'Confirming' },
              { value: 'completed', label: 'Completed' },
            ],
          },
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
      />

      <Table
        columns={columns}
        data={filtered}
        onSort={(key, dir) => { setSortKey(key); setSortDir(dir); }}
        sortKey={sortKey}
        sortDirection={sortDir}
        emptyMessage="No deposits found"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDeposit ? 'Edit Deposit' : 'Add Deposit'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">User</label>
            <input
              required
              value={form.user}
              onChange={(e) => setForm({ ...form, user: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              placeholder="User name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount ($)</label>
              <input
                required
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Network</label>
              <select
                value={form.network}
                onChange={(e) => setForm({ ...form, network: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="TRC20">TRC20</option>
                <option value="ERC20">ERC20</option>
                <option value="BEP20">BEP20</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-500"
              placeholder="Wallet address"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">TXID</label>
            <input
              value={form.txid}
              onChange={(e) => setForm({ ...form, txid: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-500"
              placeholder="Transaction ID"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Deposit['status'] })}
              className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="detected">Detected</option>
              <option value="confirming">Confirming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {editingDeposit ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Deposits;
