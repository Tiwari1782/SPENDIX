import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { SkeletonCard, SkeletonTable } from '../components/SkeletonLoader';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis
} from 'recharts';
import {
  RiMoneyDollarCircleLine, RiAlertLine, RiCalendarEventLine,
  RiUserUnfollowLine, RiStackLine, RiArrowUpLine, RiArrowDownLine,
  RiSparklingLine, RiShieldCheckLine, RiExternalLinkLine,
  RiArrowRightLine, RiTimeLine, RiFireLine, RiCheckboxCircleLine,
  RiInformationLine, RiRefreshLine
} from 'react-icons/ri';

/* ─── Tiny sparkline mock data generator ─── */
const spark = (base, len = 7, variance = 0.25) =>
  Array.from({ length: len }, (_, i) => ({
    i,
    v: Math.max(0, base * (1 + (Math.random() - 0.5) * variance * (i / len)))
  }));

/* ─── Animated number counter ─── */
function CountUp({ target, prefix = '', suffix = '', duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const raf = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target]);
  return <>{prefix}{val.toLocaleString('en-IN')}{suffix}</>;
}

/* ─── Metric Card ─── */
function MetricCard({ title, value, prefix, suffix, color, icon: Icon, trend, trendLabel, sparkData, delay = 0, onClick }) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100', accent: '#6366F1', light: '#EEF2FF' },
    red:    { bg: 'bg-red-50',    icon: 'text-red-500',    border: 'border-red-100',    accent: '#EF4444', light: '#FEF2F2' },
    emerald:{ bg: 'bg-emerald-50',icon: 'text-emerald-600',border: 'border-emerald-100',accent: '#10B981', light: '#ECFDF5' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'border-amber-100',  accent: '#F59E0B', light: '#FFFBEB' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 p-5 relative overflow-hidden cursor-pointer"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {/* Decorative top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: c.accent }} />

      {/* Icon + Title */}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${c.bg} ${c.border} border`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0
              ? <RiArrowUpLine className="w-3 h-3" />
              : <RiArrowDownLine className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">
        <CountUp target={value} prefix={prefix} suffix={suffix} />
      </p>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{title}</p>

      {trendLabel && (
        <p className="text-xs text-slate-400 mt-1">{trendLabel}</p>
      )}

      {/* Sparkline */}
      {sparkData && (
        <div className="mt-3 -mx-1" style={{ height: 36 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c.accent} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={c.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={c.accent} strokeWidth={1.5} fill={`url(#sg-${color})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}