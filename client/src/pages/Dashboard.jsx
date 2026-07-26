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

/* ─── Section Header ─── */
function SectionHeader({ title, action, actionLabel }) {
    return (
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        {action && (
          <button
            onClick={action}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            {actionLabel} <RiArrowRightLine className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
  
  /* ─── Risk Badge ─── */
  function RiskBadge({ days }) {
    if (days <= 30) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">{days}d</span>;
    if (days <= 60) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">{days}d</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">{days}d</span>;
  }
  
  /* ─── Status Dot ─── */
  function StatusDot({ color }) {
    const map = { red: 'bg-red-400', amber: 'bg-amber-400', green: 'bg-emerald-400', indigo: 'bg-indigo-400' };
    return <span className={`inline-block w-2 h-2 rounded-full ${map[color] || map.indigo}`} />;
  }
  
  /* ─── Empty State ─── */
  function EmptyState({ icon: Icon, message }) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    );
  }
  
  /* ─── Activity item ─── */
  function ActivityItem({ icon: Icon, color, title, sub, time }) {
    const map = { red: 'bg-red-50 text-red-500', amber: 'bg-amber-50 text-amber-600', indigo: 'bg-indigo-50 text-indigo-600', emerald: 'bg-emerald-50 text-emerald-600' };
    return (
      <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
        <div className={`mt-0.5 p-1.5 rounded-lg ${map[color] || map.indigo} shrink-0`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{title}</p>
          <p className="text-xs text-slate-400">{sub}</p>
        </div>
        <p className="text-xs text-slate-300 shrink-0">{time}</p>
      </div>
    );
  }
  
  /* ─── Main Dashboard ─── */
  export default function Dashboard() {
    const { companyId } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary]       = useState(null);
    const [tools, setTools]           = useState([]);
    const [renewals, setRenewals]     = useState([]);
    const [offboarding, setOffboarding] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
  
    const fetchAll = async (silent = false) => {
      if (!companyId) return;
      if (!silent) setLoading(true); else setRefreshing(true);
      try {
        const [s, t, r, o] = await Promise.all([
          api.getSummary(companyId),
          api.getTools(companyId),
          api.getRenewals(companyId),
          api.getOffboarding(companyId)
        ]);
        setSummary(s.data);
        setTools(t.data || []);
        setRenewals(r.data || []);
        setOffboarding(o.data || []);
        setLastUpdated(new Date());
      } catch (_) {}
      finally { setLoading(false); setRefreshing(false); }
    };
  
    useEffect(() => { fetchAll(); }, [companyId]);

    if (loading) return (
      <div className="space-y-6 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonTable />
      </div>
    );
  
    const spend   = summary?.total_monthly_spend || 0;
    const waste   = summary?.total_monthly_waste || 0;
    const savings = waste * 12;
    const topWaste = [...tools].sort((a, b) => (b.monthly_waste || 0) - (a.monthly_waste || 0)).slice(0, 5);
    const wastePercent = spend > 0 ? Math.round((waste / spend) * 100) : 0;
  
    const cards = [
      {
        title: 'Total Monthly Spend', value: spend, prefix: '₹', color: 'indigo',
        icon: RiMoneyDollarCircleLine, trend: -4, trendLabel: 'vs last month',
        sparkData: spark(spend, 7, 0.15), onClick: () => navigate('/licenses')
      },
      {
        title: 'Monthly Waste', value: waste, prefix: '₹', color: 'red',
        icon: RiFireLine, trend: 12, trendLabel: `${wastePercent}% of total spend`,
        sparkData: spark(waste, 7, 0.3), onClick: () => navigate('/licenses')
      },
      {
        title: 'Annual Savings Potential', value: savings, prefix: '₹', color: 'emerald',
        icon: RiSparklingLine, trendLabel: 'If all waste eliminated',
        sparkData: spark(savings, 7, 0.1), onClick: () => navigate('/forecast')
      },
      {
        title: 'Upcoming Renewals', value: renewals.length, color: 'amber',
        icon: RiCalendarEventLine, trendLabel: 'Next 90 days',
        sparkData: spark(renewals.length + 2, 7, 0.4), onClick: () => navigate('/renewals')
      },
      {
        title: 'Offboarding Risks', value: offboarding.length, color: 'red',
        icon: RiUserUnfollowLine, trendLabel: 'Ex-employees with active licenses',
        sparkData: spark(offboarding.length + 1, 7, 0.2), onClick: () => navigate('/offboarding')
      },
      {
        title: 'Active Tools', value: summary?.total_tools || tools.length, color: 'indigo',
        icon: RiStackLine, trendLabel: `${tools.filter(t => t.is_shadow_it).length || 0} shadow IT detected`,
        sparkData: spark(tools.length, 7, 0.05), onClick: () => navigate('/shadow-it')
      },
    ];
  
    /* Mock spend-by-category for the bar chart */
    const categorySpend = Object.values(
      tools.reduce((acc, t) => {
        const cat = t.category || 'Other';
        acc[cat] = acc[cat] || { category: cat.replace('_', ' '), spend: 0 };
        acc[cat].spend += t.total_monthly_cost || (t.seats_purchased * t.monthly_cost_per_seat) || 0;
        return acc;
      }, {})
    ).sort((a, b) => b.spend - a.spend).slice(0, 5);
  
    /* Health score (simple heuristic) */
    const healthScore = Math.max(0, Math.min(100, 100 - wastePercent * 1.5 - offboarding.length * 3 - (renewals.filter(r => (r.days_until_renewal ?? 91) <= 30).length) * 5));
    const healthColor = healthScore >= 75 ? 'emerald' : healthScore >= 50 ? 'amber' : 'red';
    const healthLabel = healthScore >= 75 ? 'Good' : healthScore >= 50 ? 'Fair' : 'At Risk';
  
    /* Activity feed (derived from real data) */
    const activities = [
      ...offboarding.slice(0, 2).map(o => ({
        icon: RiUserUnfollowLine, color: 'red',
        title: `${o.employee_name || 'Ex-employee'} has active licenses`,
        sub: `${o.active_license_count || 1} tools still accessible`,
        time: 'Now'
      })),
      ...renewals.slice(0, 2).map(r => ({
        icon: RiCalendarEventLine, color: 'amber',
        title: `${r.tool_name} renews in ${r.days_until_renewal ?? '?'} days`,
        sub: r.auto_renewal ? 'Auto-renewal ON — action needed' : 'Manual renewal required',
        time: r.renewal_date
      })),
      ...topWaste.slice(0, 1).map(t => ({
        icon: RiAlertLine, color: 'red',
        title: `${t.tool_name} has ${t.unused_seats || 0} idle seats`,
        sub: `₹${(t.monthly_waste || 0).toLocaleString('en-IN')} wasted per month`,
        time: 'Today'
      })),
    ].slice(0, 5);
  
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 pb-6"
      >
  