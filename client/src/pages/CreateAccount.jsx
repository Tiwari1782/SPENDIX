import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  RiUserLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine,
  RiBuildingLine, RiGlobalLine, RiTeamLine, RiShieldUserLine,
  RiArrowRightLine, RiArrowLeftLine, RiCheckLine, RiSparklingLine,
  RiSettings3Line, RiCheckboxCircleLine
} from 'react-icons/ri';

/* ─── Data ─── */
const industries = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Education', 'Retail', 'E-commerce', 'Media', 'Consulting', 'Logistics', 'Other'];
const empRanges  = ['1–50', '50–100', '100–250', '250–500', '500–1,000', '1,000–2,000', '2,000+'];
const roles = [
  { label: 'IT Admin',      desc: 'Full platform access — manage tools, teams, and integrations',    icon: RiShieldUserLine, color: '#6366F1', bg: '#EEF2FF' },
  { label: 'Finance Head',  desc: 'View spend reports, forecasts, benchmarks, and waste analysis',   icon: RiGlobalLine,     color: '#10B981', bg: '#ECFDF5' },
  { label: 'Operations',    desc: 'Manage provisioning workflows, offboarding, and compliance',       icon: RiSettings3Line,  color: '#F59E0B', bg: '#FFFBEB' },
];

const steps = [
  { num: 1, label: 'Your account' },
  { num: 2, label: 'Your company' },
  { num: 3, label: 'Your role' },
];

/* ─── Left-panel content per step ─── */
const panels = [
  {
    eyebrow: 'Step 1 of 3',
    title: 'Set up your credentials',
    body: 'Your account is tied to your work email. Use a password you\'d feel comfortable giving your IT team.',
    stat: { val: '₹18L+', label: 'Average annual savings per company' },
  },
  {
    eyebrow: 'Step 2 of 3',
    title: 'Tell us about your company',
    body: 'We use this to benchmark your spend against similar Indian companies in your industry and size range.',
    stat: { val: '200+', label: 'Indian companies already on Spendix' },
  },
  {
    eyebrow: 'Step 3 of 3',
    title: 'Pick your role',
    body: 'Your role determines your default dashboard view. You can invite teammates with different roles later.',
    stat: { val: '< 10 min', label: 'Average time to first insight' },
  },
];

/* ─── Helpers ─── */
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
  };
  const slideIn = (dir = 1) => ({
    hidden: { opacity: 0, x: 28 * dir },
    visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit:   { opacity: 0, x: -28 * dir, transition: { duration: 0.3 } }
  });
  
  function InputField({ icon: Icon, label, hint, ...props }) {
    return (
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}{hint && <span className="text-slate-400 font-normal ml-1">({hint})</span>}</label>
        <div className="relative group">
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            {...props}
            className="w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl transition-all outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 placeholder:text-slate-400"
          />
        </div>
      </div>
    );
  }
  
  function SelectField({ label, hint, children, ...props }) {
    return (
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}{hint && <span className="text-slate-400 font-normal ml-1">({hint})</span>}</label>
        <select
          {...props}
          className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl transition-all outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 appearance-none cursor-pointer"
        >
          {children}
        </select>
      </div>
    );
  }
  
  /* ─── Password strength ─── */
  function PasswordStrength({ password }) {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const c = colors[score - 1] || '#E2E8F0';
    return (
      <div className="mt-2.5 space-y-1.5">
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} className="flex-1 h-1 rounded-full"
              style={{ background: i < score ? c : '#E2E8F0' }}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.05 }} />
          ))}
        </div>
        <p className="text-xs font-medium" style={{ color: c }}>{labels[score - 1] || 'Too short'}</p>
      </div>
    );
  }