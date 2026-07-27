import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import usePageLoader from '../hooks/usePageLoader';
import SpendixLoader from '../components/SpendixLoader';
import ForecastChart from '../components/ForecastChart';
import { SkeletonChart, SkeletonTable } from '../components/SkeletonLoader';
import {
  RiLineChartLine, RiRefreshLine, RiSparklingLine,
  RiMoneyDollarCircleLine, RiArrowUpLine, RiArrowDownLine,
  RiArrowRightLine, RiBarChartGroupedLine, RiTimeLine,
  RiFlashlightLine, RiCloseLine, RiCheckLine,
} from 'react-icons/ri';

/* ─── Animation ─── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Confidence config ─── */
const CONFIDENCE = {
  high:   { label: 'High',   bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', dot: '#10B981' },
  medium: { label: 'Medium', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', dot: '#F59E0B' },
  low:    { label: 'Low',    bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', dot: '#EF4444' },
};

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, prefix = '', sub, color, trend }) {
  const p = {
    indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  border: 'border-indigo-100',  bar: '#6366F1' },
    red:     { bg: 'bg-red-50',     icon: 'text-red-500',     border: 'border-red-100',     bar: '#EF4444' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100',   bar: '#F59E0B' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100', bar: '#10B981' },
  };
  const c = p[color] || p.indigo;
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
      className="bg-white rounded-2xl border border-slate-100 p-5 relative overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: c.bar }} />
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${c.bg} border ${c.border}`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg ${
              trend >= 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {trend >= 0 ? <RiArrowUpLine className="w-3 h-3" /> : <RiArrowDownLine className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

/* ─── Confidence Badge ─── */
function ConfidenceBadge({ level }) {
  const cfg = CONFIDENCE[level] || CONFIDENCE.medium;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

/* ─── Forecast Month Pills ─── */
function ForecastPills({ forecasts }) {
  if (!forecasts?.length) {
    return <span className="text-xs text-slate-300 italic">No forecast</span>;
  }
  return (
    <div className="flex gap-1.5 flex-wrap">
      {forecasts.map((f, i) => {
        const cfg = CONFIDENCE[f.confidence_level] || CONFIDENCE.medium;
        return (
          <span
            key={i}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            ₹{(f.projected_spend / 1000).toFixed(1)}k
          </span>
        );
      })}
    </div>
  );
}