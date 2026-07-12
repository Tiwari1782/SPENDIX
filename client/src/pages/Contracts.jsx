import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import usePageLoader from '../hooks/usePageLoader';
import SpendixLoader from '../components/SpendixLoader';
import ContractUpload from '../components/ContractUpload';
import { SkeletonTable } from '../components/SkeletonLoader';
import {
  RiFilePaper2Line, RiEyeLine, RiDeleteBin5Line, RiCloseLine,
  RiCheckLine, RiAlertLine, RiCheckboxCircleLine, RiTimeLine,
  RiShieldCheckLine,
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
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100',   bar: '#F59E0B' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100', bar: '#10B981' },
    red:     { bg: 'bg-red-50',     icon: 'text-red-500',     border: 'border-red-100',     bar: '#EF4444' },
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
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </motion.div>
  );
}
/* ─── Status badge ─── */
function StatusBadge({ status }) {
    const map = {
      parsed:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-400', label: 'Parsed' },
      failed:  { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100',     dot: 'bg-red-400',     label: 'Failed' },
      pending: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100',   dot: 'bg-amber-400',   label: 'Pending' },
    };
    const cfg = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }
  
  /* ═══════════════ MAIN PAGE ═══════════════ */
  export default function Contracts() {
    const { companyId } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [viewContract, setViewContract] = useState(null);
  
    const { phase, data } = usePageLoader(async () => {
      if (!companyId) return { contracts: [], tools: [] };
      const [c, t] = await Promise.all([api.getContracts(companyId), api.getTools(companyId)]);
      return { contracts: c.data || [], tools: t.data || [] };
    }, [companyId]);
  
    const [contracts, setContracts] = useState(null);
    const currentContracts = contracts ?? data?.contracts ?? [];
    const tools = data?.tools ?? [];
  
    /* ── Derived stats ── */
    const parsed    = currentContracts.filter(c => c.parse_status === 'parsed').length;
    const failed    = currentContracts.filter(c => c.parse_status === 'failed').length;
    const autoRenew = currentContracts.filter(c => c.parsed_auto_renewal).length;
    const escalation= currentContracts.filter(c => c.parsed_price_escalation_percent).length;
  
    const handleUpload = async (file, toolId) => {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('contract', file);
        fd.append('tool_id', toolId);
        fd.append('company_id', companyId);
        await api.uploadContract(fd);
        const res = await api.getContracts(companyId);
        setContracts(res.data || []);
      } catch {}
      setUploading(false);
    };
  
    const handleView = async (c) => {
      try {
        const res = await api.getContract(c.id);
        setViewContract(res.data);
      } catch { setViewContract(c); }
    };
  
    const handleDelete = async (id) => {
      await api.deleteContract(id);
      setContracts(prev => (prev || currentContracts).filter(c => c.id !== id));
    };
  
    if (phase === 'loader') return <SpendixLoader fullPage />;
    if (phase === 'skeleton') return <SkeletonTable />;
  
    return (
      <motion.div
        initial="hidden" animate="visible" variants={containerVariants}
        className="space-y-5 pb-6"
      >
        {/* ══ PAGE HEADER ══ */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                <RiFilePaper2Line className="w-4 h-4 text-indigo-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Contract Intelligence</h1>
            </div>
            <p className="text-sm text-slate-400 ml-9">
              {currentContracts.length} contract{currentContracts.length !== 1 ? 's' : ''} uploaded &middot; AI-parsed for risk clauses
            </p>
          </div>
        </motion.div>

     {/* ══ STAT CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={RiFilePaper2Line}     label="Total Contracts"  value={currentContracts.length} color="indigo"  sub="Across all tools" />
        <StatCard icon={RiCheckboxCircleLine} label="Parsed"           value={parsed}    color="emerald" sub={`${failed} failed`} />
        <StatCard icon={RiAlertLine}          label="Auto-Renewal ON"  value={autoRenew}  color="amber"   sub="Needs review" />
        <StatCard icon={RiShieldCheckLine}    label="Price Escalation" value={escalation}  color="red"     sub="Contracts with increases" />
      </div>

      {/* ══ UPLOAD ══ */}
      <motion.div variants={itemVariants}>
        <ContractUpload tools={tools} onUpload={handleUpload} uploading={uploading} />
      </motion.div>

      {/* ══ CONTRACTS TABLE ══ */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">All Contracts</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#EEF2FF', color: '#6366F1' }}>
              {currentContracts.length}
            </span>
          </div>
        </div>

        {currentContracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Tool', 'File', 'Status', 'Auto-Renewal', 'Escalation', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentContracts.map((c, i) => (
                  <motion.tr
                    key={c.id || i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                          {c.tool_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-semibold text-slate-700 truncate max-w-[120px]">{c.tool_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs truncate max-w-[140px]">{c.file_name}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={c.parse_status} /></td>
                    <td className="px-5 py-3.5">
                      {c.parsed_auto_renewal ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <RiAlertLine className="w-3 h-3" /> Active
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.parsed_price_escalation_percent ? (
                        <span className="text-xs font-bold text-red-500">{c.parsed_price_escalation_percent}%</span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleView(c)}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                          <RiEyeLine className="w-3.5 h-3.5" /> View
                        </button>
                        <div className="w-px h-3 bg-slate-200" />
                        <button onClick={() => handleDelete(c.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">
                          <RiDeleteBin5Line className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', border: '1px solid #C7D2FE' }}>
              <RiFilePaper2Line className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No contracts uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Upload a contract above and Groq AI will extract renewal terms, escalation clauses, and risk flags</p>
          </div>
        )}
      </motion.div>
           {/* ══ VIEW CONTRACT MODAL ══ */}
           <AnimatePresence>
        {viewContract && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
              onClick={() => setViewContract(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            >
              <div
                className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col pointer-events-auto overflow-hidden"
                style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)' }}
              >
                {/* Modal header */}
                <div
                  className="relative px-6 py-5 shrink-0 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
                    borderBottom: '1px solid rgba(99,102,241,0.2)',
                  }}
                >
                  <div className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }}
                  />
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)' }}>
                          <RiFilePaper2Line className="w-3.5 h-3.5 text-indigo-300" />
                        </div>
                        <h3 className="text-base font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
                          {viewContract.tool_name} — Contract
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 ml-9">AI-parsed contract details</p>
                    </div>
                    <button onClick={() => setViewContract(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  </div>
                </div>
 
            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {viewContract.groq_summary && (
                    <div className="rounded-xl p-4" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1.5">AI Summary</p>
                      <p className="text-sm text-indigo-900 leading-relaxed">{viewContract.groq_summary}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {[
                      { label: 'Auto-Renewal', value: viewContract.parsed_auto_renewal ? 'Yes — action needed' : 'No', danger: viewContract.parsed_auto_renewal },
                      { label: 'Notice Period', value: viewContract.parsed_notice_period_days ? `${viewContract.parsed_notice_period_days} days` : '—' },
                      { label: 'Price Escalation', value: viewContract.parsed_price_escalation_percent ? `${viewContract.parsed_price_escalation_percent}%` : '—', danger: !!viewContract.parsed_price_escalation_percent },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                        <span className="text-xs text-slate-400 font-medium">{row.label}</span>
                        <span className={`text-sm font-semibold ${row.danger ? 'text-red-500' : 'text-slate-700'}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {viewContract.parsed_penalty_clause && (
                    <div className="rounded-xl p-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                      <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1.5">Penalty Clause</p>
                      <p className="text-sm text-red-800 leading-relaxed">{viewContract.parsed_penalty_clause}</p>
                    </div>
                  )}

                  {viewContract.parsed_termination_clause && (
                    <div className="rounded-xl p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Termination Clause</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{viewContract.parsed_termination_clause}</p>
                    </div>
                  )}
                </div>

                {/* Modal footer */}
                <div className="px-6 py-4 shrink-0 flex items-center justify-end" style={{ borderTop: '1px solid #F1F5F9' }}>
                  <button onClick={() => setViewContract(null)}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                    Close <RiCloseLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
