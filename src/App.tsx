import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import CommandPalette from './components/CommandPalette';
import MobileBottomNav from './components/MobileBottomNav';
import { ToastProvider } from './components/ToastProvider';
import Activity from './pages/Activity';
import ApiKeys from './pages/ApiKeys';
import Dashboard from './pages/Dashboard';
import Deposits from './pages/Deposits';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Users from './pages/Users';
import Wallets from './pages/Wallets';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteQuery(globalSearch);
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearch]);

  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.9),rgba(2,6,23,1))]" />
          <div className="relative flex min-h-screen">
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex min-w-0 flex-1 flex-col">
              <AppHeader
                onMenuToggle={() => setSidebarOpen((value) => !value)}
                onOpenCommandPalette={(initialQuery) => {
                  setPaletteQuery(initialQuery ?? '');
                  setPaletteOpen(true);
                }}
                onSearchChange={setGlobalSearch}
                searchQuery={globalSearch}
              />
              <main className="flex-1 overflow-auto pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/deposits" element={<Deposits />} />
                  <Route path="/wallets" element={<Wallets />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/api-keys" element={<ApiKeys />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <MobileBottomNav />
            </div>
          </div>
        </div>
        <CommandPalette
          key={paletteOpen ? `open:${paletteQuery}` : 'closed'}
          open={paletteOpen}
          initialQuery={paletteQuery}
          onClose={() => setPaletteOpen(false)}
        />
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
