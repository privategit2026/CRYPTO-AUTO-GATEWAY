import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowDownToLine, Wallet, Users, X, Zap } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/deposits', label: 'Deposits', icon: ArrowDownToLine },
  { path: '/wallets', label: 'Wallets', icon: Wallet },
  { path: '/users', label: 'Users', icon: Users },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-700 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-2">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">CryptoGate</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Online
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
