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