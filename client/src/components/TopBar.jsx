import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RiSearchLine, RiNotification3Line, RiArrowDownSLine, RiLogoutBoxRLine, RiUserLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import * as api from '../services/api';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/licenses': 'License Management',
  '/shadow-it': 'Shadow IT Discovery',
  '/renewals': 'Contract Renewals',
  '/offboarding': 'Offboarding Risks',
  '/overlaps': 'Tool Overlaps',
  '/forecast': 'Spend Forecast',
  '/workflows': 'Workflows',
  '/contracts': 'Contract Intelligence',
  '/benchmarks': 'Peer Benchmarks',
  '/integrations': 'Integrations',
  '/settings': 'Settings',
};

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, companyId } = useAuth();
  const { unreadCount } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [search, setSearch] = useState('');

  const pageTitle = pageTitles[location.pathname] || 'Spendix';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 h-16 bg-white border-b border-border flex items-center justify-between px-6 z-30" style={{ left: '240px' }}>
      <h1 className="text-lg font-semibold text-text-primary">{pageTitle}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Search tools, employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-56 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
          />
        </div>
         {/* Notifications */}
         <button onClick={() => navigate('/notifications')} className="relative p-2 text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors">
          <RiNotification3Line size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-danger rounded-full px-1">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 py-1.5 px-2 hover:bg-background rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium text-text-primary hidden md:block">{user?.name}</span>
            <RiArrowDownSLine size={16} className="text-text-muted" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
                <button onClick={() => { setShowUserMenu(false); navigate('/settings'); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-background transition-colors">
                  <RiUserLine size={16} /> Profile
                </button>
                <hr className="border-border my-1" />
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors">
                  <RiLogoutBoxRLine size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}