import React from 'react';
import { useStore } from '../store/useStore';
import { ArrowDownToLine, Wallet, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { deposits, wallets, users } = useStore();

  const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
  const pendingDeposits = deposits.filter((d) => d.status === 'pending').length;
  const completedDeposits = deposits.filter((d) => d.status === 'completed').length;
  const confirmingDeposits = deposits.filter((d) => d.status === 'confirming').length;
  const activeWallets = wallets.filter((w) => w.status === 'active').length;
  const activeUsers = users.filter((u) => u.status === 'active').length;

  const stats = [
    {
      title: 'Total Deposits',
      value: `$${totalDeposits.toLocaleString()}`,
      subtitle: `${deposits.length} transactions`,
      icon: <ArrowDownToLine size={20} className="text-blue-300" />,
      color: 'bg-blue-600/20',
    },
    {
      title: 'Pending',
      value: pendingDeposits,
      subtitle: 'Awaiting detection',
      icon: <Clock size={20} className="text-yellow-300" />,
      color: 'bg-yellow-600/20',
    },
    {
      title: 'Completed',
      value: completedDeposits,
      subtitle: 'Successfully processed',
      icon: <CheckCircle size={20} className="text-green-300" />,
      color: 'bg-green-600/20',
    },
    {
      title: 'Confirming',
      value: confirmingDeposits,
      subtitle: 'Waiting confirmations',
      icon: <TrendingUp size={20} className="text-purple-300" />,
      color: 'bg-purple-600/20',
    },
    {
      title: 'Active Wallets',
      value: activeWallets,
      subtitle: `${wallets.length} total`,
      icon: <Wallet size={20} className="text-cyan-300" />,
      color: 'bg-cyan-600/20',
    },
    {
      title: 'Active Users',
      value: activeUsers,
      subtitle: `${users.length} total`,
      icon: <Users size={20} className="text-pink-300" />,
      color: 'bg-pink-600/20',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of your crypto payment system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Deposits</h2>
          <span className="text-sm text-gray-400">{deposits.slice(0, 5).length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium pb-3 pr-4">User</th>
                <th className="text-left text-gray-400 font-medium pb-3 pr-4">Amount</th>
                <th className="text-left text-gray-400 font-medium pb-3 pr-4">Network</th>
                <th className="text-left text-gray-400 font-medium pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/40">
              {deposits.slice(0, 5).map((d) => (
                <tr key={d.id} className="hover:bg-gray-700/20 transition-colors">
                  <td className="py-3 pr-4 text-gray-200">{d.user}</td>
                  <td className="py-3 pr-4 text-green-400 font-medium">${d.amount}</td>
                  <td className="py-3 pr-4">
                    <span className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded text-xs font-medium">{d.network}</span>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 bg-gray-800 rounded-xl border border-gray-700 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">System Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'TRC20 Node', status: 'Online' },
            { label: 'ERC20 Node', status: 'Online' },
            { label: 'BEP20 Node', status: 'Online' },
          ].map(({ label, status }) => (
            <div key={label} className="flex items-center justify-between bg-gray-700/40 rounded-lg px-4 py-3">
              <span className="text-gray-300 text-sm">{label}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs font-medium">{status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  detected: 'bg-blue-500/20 text-blue-400',
  detecting: 'bg-blue-500/20 text-blue-400',
  confirming: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-green-500/20 text-green-400',
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[status] || 'bg-gray-500/20 text-gray-400'}`}>
    {status}
  </span>
);

export default Dashboard;
