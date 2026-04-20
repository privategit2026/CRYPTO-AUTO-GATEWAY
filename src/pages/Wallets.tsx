import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { type Wallet as WalletType } from '../mock/wallets';
import Table, { type Column } from '../components/Table';
import Filters from '../components/Filters';
import Modal from '../components/Modal';
import { Edit2, Trash2, Plus } from 'lucide-react';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  used: 'bg-yellow-500/20 text-yellow-400',
  inactive: 'bg-gray-500/20 text-gray-400',
};

const Wallets: React.FC = () => {
  const { wallets, addWallet, updateWallet, deleteWallet } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);
  const [form, setForm] = useState({ address: '', user: '', network: 'TRC20', status: 'active' as WalletType['status'] });

  const filtered = useMemo(() => {
    let result = [...wallets];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((w) =>
        w.address.toLowerCase().includes(q) || w.user.toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter((w) => w.status === statusFilter);
    if (networkFilter) result = result.filter((w) => w.network === networkFilter);
    return result;
  }, [wallets, search, statusFilter, networkFilter]);

  const columns: Column<WalletType>[] = [
    { key: 'address', label: 'Address', render: (v) => <span className="font-mono text-xs text-gray-300">{String(v)}</span> },
    { key: 'user', label: 'Assigned User' },
    { key: 'network', label: 'Network', render: (v) => <span className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded text-xs font-medium">{String(v)}</span> },
    { key: 'createdAt', label: 'Created' },
    { key: 'status', label: 'Status', render: (v) => <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[String(v)] || ''}`}>{String(v)}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleEdit(row)} className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-400/10 rounded transition-colors">
            <Edit2 size={15} />
          </button>
          <button onClick={() => deleteWallet(row.id)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (wallet: WalletType) => {
    setEditingWallet(wallet);
    setForm({ address: wallet.address, user: wallet.user, network: wallet.network, status: wallet.status });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingWallet(null);
    setForm({ address: '', user: '', network: 'TRC20', status: 'active' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWallet) {
      updateWallet(editingWallet.id, form);
    } else {
      const newId = Math.max(0, ...wallets.map((w) => w.id)) + 1;
      addWallet({ id: newId, ...form, createdAt: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallets</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} wallets found</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Wallet
        </button>
      </div>

      <Filters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by address or user..."
        filters={[
          {
            label: 'All Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'active', label: 'Active' },
              { value: 'used', label: 'Used' },
              { value: 'inactive', label: 'Inactive' },
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

      <Table columns={columns} data={filtered} emptyMessage="No wallets found" />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingWallet ? 'Edit Wallet' : 'Add Wallet'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Wallet Address</label>
            <input
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-500"
              placeholder="Wallet address"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Assigned User</label>
            <input
              value={form.user}
              onChange={(e) => setForm({ ...form, user: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              placeholder="User name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as WalletType['status'] })}
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {editingWallet ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Wallets;
