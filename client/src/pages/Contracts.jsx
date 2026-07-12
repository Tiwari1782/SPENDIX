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
  