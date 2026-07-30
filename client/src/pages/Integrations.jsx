import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import usePageLoader from '../hooks/usePageLoader';
import SpendixLoader from '../components/SpendixLoader';
import { SkeletonCard } from '../components/SkeletonLoader';
import {
  RiPlugLine, RiGoogleLine, RiSlackLine, RiRefreshLine,
  RiLinkUnlink, RiCheckboxCircleLine, RiAlertLine,
  RiArrowRightLine,
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

/* ─── Integration meta ─── */
const integrationMeta = {
  google_workspace: { name: 'Google Workspace', icon: RiGoogleLine, gradient: 'linear-gradient(135deg, #4285F4, #1A73E8)' },
  zoho_books:       { name: 'Zoho Books',       icon: RiPlugLine,   gradient: 'linear-gradient(135deg, #10B981, #059669)' },
  razorpay:         { name: 'Razorpay',          icon: RiPlugLine,   gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
  slack:            { name: 'Slack',             icon: RiSlackLine,  gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' },
  jira:             { name: 'Jira',              icon: RiPlugLine,   gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
};

/* ─── Status badge ─── */
function StatusBadge({ status }) {
  const map = {
    connected:    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-400', label: 'Connected' },
    disconnected: { bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-300',   label: 'Disconnected' },
    error:        { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100',     dot: 'bg-red-400 animate-pulse', label: 'Error' },
  };
  const cfg = map[status] || map.disconnected;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

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
export default function Integrations() {
  const { companyId } = useAuth();
  const [syncing, setSyncing] = useState(null);

  const { phase, data } = usePageLoader(async () => {
    if (!companyId) return [];
    const res = await api.getIntegrations(companyId);
    return res.data || [];
  }, [companyId]);

  const [integrations, setIntegrations] = useState(null);
  const currentIntegrations = integrations ?? data ?? [];

  /* ── Derived stats ── */
  const connected  = currentIntegrations.filter(i => i.status === 'connected').length;
  const errors     = currentIntegrations.filter(i => i.status === 'error').length;
  const total      = currentIntegrations.length;

  const handleSync = async (id) => {
    setSyncing(id);
    try {
      await api.syncIntegration(id);
      const res = await api.getIntegrations(companyId);
      setIntegrations(res.data || []);
    } catch {}
    setSyncing(null);
  };

  const handleConnect = async (type) => {
    try {
      await api.connectIntegration({ company_id: companyId, integration_type: type, credentials: {} });
      const res = await api.getIntegrations(companyId);
      setIntegrations(res.data || []);
    } catch {}
  };

  const handleDisconnect = async (id) => {
    try {
      await api.disconnectIntegration(id);
      const res = await api.getIntegrations(companyId);
      setIntegrations(res.data || []);
    } catch {}
  };

  if (phase === 'loader') return <SpendixLoader fullPage />;
  if (phase === 'skeleton') return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  return (
    <motion.div
      initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-5 pb-6"
    >
      {/* ══ PAGE HEADER ══ */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
            <RiPlugLine className="w-4 h-4 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Integrations</h1>
        </div>
        <p className="text-sm text-slate-400 ml-9">
          {total} integration{total !== 1 ? 's' : ''} &middot; {connected} connected
        </p>
      </motion.div>

      {/* ══ STAT CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={RiPlugLine}            label="Total"      value={total}      color="indigo"  sub="Configured integrations" />
        <StatCard icon={RiCheckboxCircleLine}  label="Connected"  value={connected}  color="emerald" sub="Actively syncing" />
        <StatCard icon={RiAlertLine}           label="Errors"     value={errors}     color="red"     sub="Needs attention" />
      </div>

      {/* ══ INTEGRATION CARDS GRID ══ */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-slate-800">All Integrations</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentIntegrations.map((intg, i) => {
            const meta = integrationMeta[intg.integration_type] || {
              name: intg.integration_type?.replace(/_/g, ' ') || 'Integration',
              icon: RiPlugLine,
              gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            };
            const Icon = meta.icon;
            const isConnected = intg.status === 'connected';

            return (
              <motion.div
                key={intg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                {/* Card top accent */}
                <div className="h-1 w-full" style={{ background: isConnected ? '#10B981' : intg.status === 'error' ? '#EF4444' : '#E2E8F0' }} />

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ background: meta.gradient }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{meta.name}</p>
                        <StatusBadge status={intg.status} />
                      </div>
                    </div>
                  </div>

                  {intg.last_synced_at && (
                    <p className="text-xs text-slate-400 mb-4">
                      Last synced: {new Date(intg.last_synced_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleSync(intg.id)}
                          disabled={syncing === intg.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                          style={{ background: '#EEF2FF', color: '#6366F1', border: '1px solid #C7D2FE' }}
                        >
                          {syncing === intg.id ? (
                            <motion.span className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-indigo-500 rounded-full"
                              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                          ) : <RiRefreshLine className="w-3.5 h-3.5" />}
                          Sync
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleDisconnect(intg.id)}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all"
                          style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }}
                        >
                          <RiLinkUnlink className="w-3.5 h-3.5" />
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleConnect(intg.integration_type)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white rounded-xl transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                          boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                        }}
                      >
                        <RiPlugLine className="w-3.5 h-3.5" /> Connect
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {currentIntegrations.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', border: '1px solid #C7D2FE' }}>
              <RiPlugLine className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No integrations configured</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Contact your admin to set up integrations with Google Workspace, Slack, or Zoho Books</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
