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
