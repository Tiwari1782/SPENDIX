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
          {/* ══ PAGE HEADER ══ */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
            <RiBarChartGroupedLine className="w-4 h-4 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Peer Benchmarks</h1>
        </div>
        <p className="text-sm text-slate-400 ml-9">
          Compare your spend against {data?.company_industry || 'similar'} companies with {data?.employee_count || '—'} employees
        </p>
      </motion.div>

      {/* ══ STAT CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={RiBarChartGroupedLine} label="Categories"  value={categories.length} color="indigo"  sub="Benchmarked categories" />
        <StatCard icon={RiArrowUpLine}         label="Overpaying"  value={overpaying}         color="red"     sub="Above industry average" />
        <StatCard icon={RiCheckboxCircleLine}  label="On Par"      value={underpaying}        color="emerald" sub="At or below average" />
      </div>

      {/* ══ OVERPAYING BANNER ══ */}
      <AnimatePresence>
        {overpaying > 0 && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 p-4 rounded-2xl border"
            style={{ background: 'linear-gradient(135deg, #FEF2F2, #FFF5F5)', borderColor: '#FECACA' }}
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <RiAlertLine className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">
                Overpaying in {overpaying} categor{overpaying > 1 ? 'ies' : 'y'}
              </p>
              <p className="text-xs text-red-400 mt-0.5">
                Your spend exceeds the industry median. Consider renegotiating or switching tools.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ AI EXPLAINER ══ */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl px-6 py-4 flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)',
          border: '1px solid rgba(99,102,241,0.15)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <RiSparklingLine className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="relative flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700">AI-powered benchmarking</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Benchmarks are computed against anonymized spend data from companies in the same industry and employee range. Minimum 5 companies required for reliable results.
          </p>
        </div>
      </motion.div>

      {/* ══ BENCHMARK CARDS ══ */}
      {categories.length > 0 ? (
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.category || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <BenchmarkWidget category={cat} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', border: '1px solid #C7D2FE' }}>
            <RiBarChartGroupedLine className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            No benchmark data
          </p>
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
            Minimum 5 companies in your industry and size bracket required for reliable peer benchmarks.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
