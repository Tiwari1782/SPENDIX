import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  RiDashboardLine, RiFileList3Line, RiSpyLine, RiCalendarEventLine,
  RiUserUnfollowLine, RiStackLine, RiLineChartLine, RiFlowChart,
  RiFilePaper2Line, RiBarChartGroupedLine, RiPlugLine, RiSettings3Line,
  RiMenuFoldLine, RiMenuUnfoldLine, RiLogoutBoxRLine,
  RiNotification3Line, RiSearchLine, RiArrowUpLine, RiShieldCheckLine,
  RiFireLine
} from 'react-icons/ri';

/* ─── Nav structure ─── */
const navGroups = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard', badge: null }]
  },
  {
    label: 'Spend Management',
    items: [
      { to: '/licenses',  icon: RiFileList3Line,     label: 'Licenses',  badge: null },
      { to: '/shadow-it', icon: RiSpyLine,            label: 'Shadow IT', badge: null },
      { to: '/overlaps',  icon: RiStackLine,          label: 'Overlaps',  badge: null },
      { to: '/forecast',  icon: RiLineChartLine,      label: 'Forecast',  badge: null },
    ]
  },
  {
    label: 'Risk & Compliance',
    items: [
      { to: '/renewals',    icon: RiCalendarEventLine, label: 'Renewals',    badge: null },
      { to: '/offboarding', icon: RiUserUnfollowLine,  label: 'Offboarding', badge: null },
      { to: '/contracts',   icon: RiFilePaper2Line,    label: 'Contracts',   badge: null },
      { to: '/workflows',   icon: RiFlowChart,         label: 'Workflows',   badge: null },
    ]
  },
  {
    label: 'Intelligence',
    items: [{ to: '/benchmarks', icon: RiBarChartGroupedLine, label: 'Benchmarks', badge: null }]
  },
  {
    label: 'System',
    items: [
      { to: '/integrations', icon: RiPlugLine,      label: 'Integrations', badge: null },
      { to: '/settings',     icon: RiSettings3Line, label: 'Settings',     badge: null },
    ]
  }
];

/* ─── Mini sparkline bars (decorative) ─── */
const SparkBars = ({ color = '#6366F1' }) => {
  const heights = [40, 70, 55, 90, 65, 80, 100];
  return (
    <div className="flex items-end gap-0.5 h-4">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-sm"
          style={{ background: color, opacity: 0.6 }}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

/* ─── Health pill ─── */
function HealthPill({ score }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const label = score >= 75 ? 'Healthy' : score >= 50 ? 'Fair' : 'At Risk';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
      <span className="text-[10px] font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
/* ─── Sidebar ─── */
export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const { user, logout } = useAuth();
    const { unreadCount: totalAlerts } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
  
    // Simulated health score — swap with real data
    const healthScore = 72;
  
    const handleLogout = async () => {
      await logout();
      navigate('/login');
    };
  
    return (
      <motion.aside
        className="fixed left-0 top-0 h-screen flex flex-col z-40 overflow-hidden"
        animate={{ width: collapsed ? 72 : 252 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'linear-gradient(160deg, #0F172A 0%, #141B2D 40%, #0F172A 100%)',
          borderRight: '1px solid rgba(99,102,241,0.12)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* ── Ambient background grid ── */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
  
        {/* ── Glowing orb top-right ── */}
        <motion.div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* ── Glowing orb bottom ── */}
        <motion.div
          className="absolute bottom-24 -left-12 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
  
        {/* ══ LOGO ══ */}
        <div
          className="relative h-16 flex items-center px-4 shrink-0 cursor-pointer hover:bg-white/5 transition-colors"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          onClick={() => navigate('/dashboard')}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo icon */}
            <div className="relative shrink-0">
              <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                <rect x="6"  y="28" width="9" height="14" rx="2.5" fill="#6366F1" opacity="0.5" />
                <rect x="19" y="17" width="9" height="25" rx="2.5" fill="#6366F1" opacity="0.75" />
                <rect x="32" y="6"  width="9" height="36" rx="2.5" fill="#6366F1" />
              </svg>
              {/* Glow behind logo */}
              <div
                className="absolute inset-0 -z-10 blur-md"
                style={{ background: 'rgba(99,102,241,0.5)' }}
              />
            </div>
  
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col min-w-0"
                >
                  <span
                    className="text-lg font-bold text-white leading-none tracking-tight"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    Spendix
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-indigo-400 leading-none mt-0.5">
                    SaaS Intelligence
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>