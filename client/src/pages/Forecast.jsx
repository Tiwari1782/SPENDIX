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
/* ─── Trend delta helper ─── */
function getDelta(current, forecast) {
    if (!current || !forecast) return null;
    return Math.round(((forecast - current) / current) * 100);
  }
  
  /* ═══════════════ MAIN PAGE ═══════════════ */
  export default function Forecast() {
    const { companyId } = useAuth();
    const [generating, setGenerating]     = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);
    const [history, setHistory]           = useState([]);
    const [localForecasts, setLocalForecasts] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);
  
    const { phase, data } = usePageLoader(async () => {
      if (!companyId) return [];
      const res = await api.getForecasts(companyId);
      return res.data || [];
    }, [companyId]);
  
    const currentData = localForecasts ?? data ?? [];
  
    /* ── Derived stats ── */
    const totalCurrent  = currentData.reduce((s, t) => s + (t.current_monthly_cost || 0), 0);
    const totalForecast = currentData.reduce((s, t) => {
      const next = t.forecasts?.[0]?.projected_spend || t.current_monthly_cost || 0;
      return s + next;
    }, 0);
    const overBudget = currentData.filter(t => {
      const next = t.forecasts?.[0]?.projected_spend || 0;
      return next > (t.current_monthly_cost || 0) * 1.1;
    }).length;
    const highConf = currentData.filter(t =>
      t.forecasts?.some(f => f.confidence_level === 'high')
    ).length;
  
    const handleGenerate = async () => {
      setGenerating(true);
      try {
        await api.generateForecasts(companyId);
        const res = await api.getForecasts(companyId);
        setLocalForecasts(res.data || []);
      } catch {}
      finally { setGenerating(false); }
    };
  
    const loadHistory = async (tool) => {
      setSelectedTool(tool);
      setHistoryLoading(true);
      try {
        const res = await api.getToolHistory(tool.tool_id);
        setHistory(res.data || []);
      } catch { setHistory([]); }
      finally { setHistoryLoading(false); }
    };
  
    if (phase === 'loader')   return <SpendixLoader fullPage />;
    if (phase === 'skeleton') return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
        <SkeletonChart />
        <SkeletonTable />
      </div>
    );
  
    return (
      <motion.div
        initial="hidden" animate="visible" variants={containerVariants}
        className="space-y-5 pb-6"
      >
        {/* ══ PAGE HEADER ══ */}
        <motion.div variants={itemVariants} className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <RiLineChartLine className="w-4 h-4 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Spend Forecast</h1>
            </div>
            <p className="text-sm text-slate-400 ml-9">
              {currentData.length} tool{currentData.length !== 1 ? 's' : ''} tracked &middot; AI-powered 3-month projections
            </p>
          </div>
  
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-white disabled:opacity-60 transition-all"
            style={{
              background: generating
                ? '#818CF8'
                : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              boxShadow: generating ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
            }}
          >
            {generating ? (
              <>
                <motion.span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                />
                Generating…
              </>
            ) : (
              <>
                <RiSparklingLine className="w-4 h-4" />
                Generate Forecasts
              </>
            )}
          </motion.button>
        </motion.div>
  
        {/* ══ STAT CARDS ══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={RiMoneyDollarCircleLine} label="Current Monthly" prefix="₹"
            value={totalCurrent} color="indigo" sub="Across all tools"
          />
          <StatCard
            icon={RiBarChartGroupedLine} label="Next Month (Projected)" prefix="₹"
            value={totalForecast} color={totalForecast > totalCurrent ? 'red' : 'emerald'}
            trend={getDelta(totalCurrent, totalForecast)}
            sub="Based on AI model"
          />
          <StatCard
            icon={RiArrowUpLine} label="Over-Budget Tools" value={overBudget}
            color="amber" sub="Projected to exceed 10%"
          />
          <StatCard
            icon={RiCheckLine} label="High Confidence" value={highConf}
            color="emerald" sub="Reliable projections"
          />
        </div>
   {/* ══ AI EXPLAINER BANNER ══ */}
   <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl px-6 py-4 flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(99,102,241,0.06) 100%)',
          border: '1px solid rgba(16,185,129,0.15)',
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div
          className="relative shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <RiFlashlightLine className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="relative flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700">Groq AI forecasting</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Projections use historical spend snapshots with LLaMA-3. High confidence = consistent spend pattern; Low confidence = volatile or sparse history.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          disabled={generating}
          className="relative shrink-0 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-50 whitespace-nowrap"
        >
          Refresh <RiArrowRightLine className="w-3.5 h-3.5" />
        </motion.button>
      </motion.div>

      {/* ══ CHART (when a tool is selected) ══ */}
      <AnimatePresence>
        {selectedTool && (
          <motion.div
            key={selectedTool.tool_id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            {/* Chart panel header */}
            <div
              className="relative px-6 py-4 flex items-center justify-between overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
                borderBottom: '1px solid rgba(99,102,241,0.18)',
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              <motion.div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative z-10 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)' }}
                >
                  <RiLineChartLine className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <p
                    className="text-base font-bold text-white leading-none"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    {selectedTool.tool_name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Spend trend &amp; 3-month forecast</p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                {selectedTool.forecasts?.[0] && (
                  <ConfidenceBadge level={selectedTool.forecasts[0].confidence_level} />
                )}
                <button
                  onClick={() => setSelectedTool(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chart body */}
            <div className="p-5">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <motion.div
                    className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                  />
                  <p className="text-sm text-slate-400">Loading trend data…</p>
                </div>
              ) : (
                <ForecastChart
                  snapshots={history}
                  forecasts={selectedTool.forecasts}
                  toolName={selectedTool.tool_name}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        {/* ══ FORECAST TABLE ══ */}
        <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        {/* Table header row */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F1F5F9' }}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">All Tool Forecasts</h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#EEF2FF', color: '#6366F1' }}
            >
              {currentData.length} tools
            </span>
          </div>
          <p className="text-xs text-slate-400">Click "View Trend" to open the chart</p>
        </div>

        {currentData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Tool', 'Current Cost', 'Last Actual', 'Month 1', 'Month 2', 'Month 3', 'Confidence', ''].map(h => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((tool, i) => {
                  const isSelected = selectedTool?.tool_id === tool.tool_id;
                  const f = tool.forecasts || [];
                  const delta = getDelta(tool.current_monthly_cost, f[0]?.projected_spend);
                  return (
                    <motion.tr
                      key={tool.tool_id || i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-slate-50 transition-colors"
                      style={{ background: isSelected ? '#EEF2FF' : undefined }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = ''; }}
                    >
                      {/* Tool name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
                          >
                            {tool.tool_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                            {tool.tool_name}
                          </span>
                        </div>
                      </td>

                      {/* Current cost */}
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800">
                          ₹{(tool.current_monthly_cost || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Last actual */}
                      <td className="px-5 py-3.5 text-slate-500">
                        {tool.last_month_actual
                          ? `₹${tool.last_month_actual.toLocaleString('en-IN')}`
                          : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Month 1, 2, 3 */}
                      {[0, 1, 2].map(idx => {
                        const fc = f[idx];
                        if (!fc) return (
                          <td key={idx} className="px-5 py-3.5">
                            <span className="text-slate-300 text-xs">—</span>
                          </td>
                        );
                        const cfg = CONFIDENCE[fc.confidence_level] || CONFIDENCE.medium;
                        return (
                          <td key={idx} className="px-5 py-3.5">
                            <span
                              className="inline-block text-xs font-bold px-2.5 py-1 rounded-lg"
                              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                            >
                              ₹{(fc.projected_spend / 1000).toFixed(1)}k
                            </span>
                          </td>
                        );
                      })}

                      {/* Confidence */}
                      <td className="px-5 py-3.5">
                        {f[0]
                          ? <ConfidenceBadge level={f[0].confidence_level} />
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>

                      {/* View trend CTA */}
                      <td className="px-5 py-3.5">
                        <motion.button
                          whileHover={{ x: 2 }}
                          onClick={() => loadHistory(tool)}
                          className="flex items-center gap-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
                          style={{ color: isSelected ? '#4F46E5' : '#6366F1' }}
                        >
                          <RiLineChartLine className="w-3.5 h-3.5" />
                          View Trend
                          <RiArrowRightLine className="w-3 h-3" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'linear-gradient(135deg, #ECFDF5, #EEF2FF)',
                border: '1px solid #C7D2FE',
              }}
            >
              <RiLineChartLine className="w-7 h-7 text-indigo-400" />
            </div>
            <p
              className="text-lg font-bold text-slate-700 mb-1"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              No forecasts yet
            </p>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-5">
              Generate AI-powered projections for every tool in your stack with one click.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              }}
            >
              <RiSparklingLine className="w-4 h-4" />
              Generate Forecasts
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}