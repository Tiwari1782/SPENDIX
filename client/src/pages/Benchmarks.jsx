import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import usePageLoader from '../hooks/usePageLoader';
import SpendixLoader from '../components/SpendixLoader';
import BenchmarkWidget from '../components/BenchmarkWidget';
import { SkeletonChart } from '../components/SkeletonLoader';
import {
  RiBarChartGroupedLine, RiAlertLine, RiCheckboxCircleLine,
  RiArrowUpLine, RiArrowDownLine, RiShieldCheckLine,
  RiSparklingLine,
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

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, sub, color }) {
  const p = {
    indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  border: 'border-indigo-100',  bar: '#6366F1' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100', bar: '#10B981' },
    red:     { bg: 'bg-red-50',     icon: 'text-red-500',     border: 'border-red-100',     bar: '#EF4444' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100',   bar: '#F59E0B' },
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
      <div className={`inline-flex p-2 rounded-xl ${c.bg} border ${c.border} mb-3`}>
        <Icon className={`w-4 h-4 ${c.icon}`} />
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight mb-0.5">
        {typeof value === 'number' ? value : value}
      </p>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function Benchmarks() {
  const { companyId } = useAuth();

  const { phase, data } = usePageLoader(async () => {
    if (!companyId) return null;
    const res = await api.getBenchmarks(companyId);
    return res.data;
  }, [companyId]);

  if (phase === 'loader') return <SpendixLoader fullPage />;
  if (phase === 'skeleton') return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <SkeletonChart key={i} />)}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonChart key={i} />)}
      </div>
    </div>
  );

  const categories = data?.categories || [];
  const overpaying = data?.overpaying_categories || 0;
  const underpaying = categories.length - overpaying;

  return (
    <motion.div
      initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-5 pb-6"
    >