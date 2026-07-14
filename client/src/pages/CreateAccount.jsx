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
  /* ─── Main Component ─── */
export default function CreateAccount() {
    const [step, setStep] = useState(1);
    const [dir, setDir]   = useState(1);
    const [showPw, setShowPw] = useState(false);
    const [form, setForm] = useState({
      name: '', email: '', password: '',
      company_name: '', company_domain: '', industry: '', employee_count_range: '',
      role: ''
    });
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate     = useNavigate();
  
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  
    const canProceed =
      step === 1 ? (form.name.trim() && form.email.trim() && form.password.length >= 6) :
      step === 2 ? form.company_name.trim() :
      !!form.role;
  
    const goNext = () => { if (!canProceed) return; setDir(1); setStep(s => s + 1); };
    const goBack = () => { setDir(-1); setStep(s => s - 1); };
  
    const handleSubmit = async () => {
      setError('');
      setLoading(true);
      try {
        await register(form);
        navigate('/onboarding');
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    const panel = panels[step - 1];
  
    return (
      <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
  
        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)' }}>
  
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
  
          {/* Orbs */}
          <motion.div className="absolute top-1/3 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], y: [0, -24, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute bottom-1/4 left-0 w-60 h-60 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)' }}
            animate={{ scale: [1.1, 1, 1.1], y: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />
  
          {/* Logo */}
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <rect x="6"  y="28" width="9" height="14" rx="2.5" fill="#6366F1" opacity="0.5"/>
                <rect x="19" y="17" width="9" height="25" rx="2.5" fill="#6366F1" opacity="0.75"/>
                <rect x="32" y="6"  width="9" height="36" rx="2.5" fill="#6366F1"/>
              </svg>
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>Spendix</span>
            </Link>
          </div>
        {/* Dynamic panel content */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">{panel.eyebrow}</p>
              <h2 className="text-4xl font-bold text-white leading-snug mb-5"
                style={{ fontFamily: "'DM Serif Display', serif" }}>
                {panel.title}
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-10">{panel.body}</p>

              {/* Stat pill */}
              <div className="inline-flex flex-col rounded-2xl px-6 py-5 border"
                style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }}>
                <span className="text-4xl font-bold text-white mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  {panel.stat.val}
                </span>
                <span className="text-slate-400 text-sm">{panel.stat.label}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step dots */}
        <div className="relative z-10 flex items-center gap-3">
          {steps.map(s => (
            <div key={s.num} className="flex items-center gap-2">
              <motion.div className="w-2 h-2 rounded-full" animate={{ scale: step === s.num ? 1.4 : 1 }}
                style={{ background: step === s.num ? '#6366F1' : step > s.num ? '#4ADE80' : '#334155' }} />
              {step === s.num && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-400">
                  {s.label}
                </motion.span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <rect x="6"  y="28" width="9" height="14" rx="2.5" fill="#6366F1" opacity="0.5"/>
              <rect x="19" y="17" width="9" height="25" rx="2.5" fill="#6366F1" opacity="0.75"/>
              <rect x="32" y="6"  width="9" height="36" rx="2.5" fill="#6366F1"/>
            </svg>
            <span className="text-xl font-bold text-slate-900" style={{ fontFamily: "'DM Serif Display', serif" }}>Spendix</span>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {steps.map((s, i) => (
                <div key={s.num} className="flex items-center" style={{ flex: i < steps.length - 1 ? '1' : 'none' }}>
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                      animate={{
                        background: step > s.num ? '#6366F1' : step === s.num ? '#EEF2FF' : '#F8FAFC',
                        borderColor: step >= s.num ? '#6366F1' : '#E2E8F0',
                        color: step > s.num ? '#fff' : step === s.num ? '#6366F1' : '#94A3B8',
                      }}>
                      {step > s.num ? <RiCheckLine className="w-3.5 h-3.5" /> : s.num}
                    </motion.div>
                    <span className="text-xs font-medium hidden sm:block"
                      style={{ color: step >= s.num ? '#6366F1' : '#94A3B8' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-px mx-3 rounded-full overflow-hidden bg-slate-200">
                      <motion.div className="h-full rounded-full bg-indigo-500"
                        animate={{ width: step > s.num ? '100%' : '0%' }}
                        transition={{ duration: 0.4 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
   {/* Error */}
   <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-3.5 rounded-xl border border-red-100 bg-red-50 text-sm text-red-600 flex items-center gap-2">
                <span className="shrink-0">⚠</span> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form steps */}
          <AnimatePresence mode="wait" custom={dir}>
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <motion.div key="step1" variants={slideIn(dir)} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'DM Serif Display', serif" }}>Create your account</h1>
                  <p className="text-slate-500 text-sm mt-1">Start your 14-day free trial. No credit card needed.</p>
                </div>

                <InputField icon={RiUserLine} label="Full Name" placeholder="Arjun Kumar"
                  type="text" value={form.name} onChange={e => set('name', e.target.value)} />

                <InputField icon={RiMailLine} label="Work Email" placeholder="arjun@yourcompany.com"
                  type="email" value={form.email} onChange={e => set('email', e.target.value)} />

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative group">
                    <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={e => set('password', e.target.value)} placeholder="Min 6 characters"
                      className="w-full pl-10 pr-12 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl transition-all outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 placeholder:text-slate-400"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPw ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                </div>
              </motion.div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <motion.div key="step2" variants={slideIn(dir)} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'DM Serif Display', serif" }}>About your company</h1>
                  <p className="text-slate-500 text-sm mt-1">Used for peer benchmarking against similar companies.</p>
                </div>

                <InputField icon={RiBuildingLine} label="Company Name" placeholder="Acme Technologies Pvt Ltd"
                  type="text" value={form.company_name} onChange={e => set('company_name', e.target.value)} />

                <InputField icon={RiGlobalLine} label="Company Domain" hint="optional" placeholder="acme.in"
                  type="text" value={form.company_domain} onChange={e => set('company_domain', e.target.value)} />

                <SelectField label="Industry" value={form.industry} onChange={e => set('industry', e.target.value)}>
                  <option value="">Select your industry</option>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </SelectField>

                <SelectField label="Employee Count" value={form.employee_count_range} onChange={e => set('employee_count_range', e.target.value)}>
                  <option value="">Select headcount range</option>
                  {empRanges.map(r => <option key={r} value={r}>{r} employees</option>)}
                </SelectField>

                {/* Benchmark note */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl border"
                  style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                  <RiSparklingLine className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    We use your industry and size to show peer benchmarks — you'll see how your SaaS spend compares to similar companies in India.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <motion.div key="step3" variants={slideIn(dir)} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'DM Serif Display', serif" }}>What's your role?</h1>
                  <p className="text-slate-500 text-sm mt-1">This sets your default dashboard view. Change it anytime.</p>
                </div>

                {roles.map((r, i) => (
                  <motion.button key={r.label} type="button" onClick={() => set('role', r.label)}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all"
                    style={{
                      borderColor: form.role === r.label ? r.color : '#E2E8F0',
                      background: form.role === r.label ? r.bg : 'white',
                      boxShadow: form.role === r.label ? `0 4px 16px ${r.color}20` : 'none'
                    }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      style={{ background: form.role === r.label ? r.color : '#F1F5F9' }}>
                      <r.icon className="w-5 h-5 transition-colors"
                        style={{ color: form.role === r.label ? 'white' : '#64748B' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-900">{r.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.desc}</p>
                    </div>
                    <motion.div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: form.role === r.label ? r.color : '#E2E8F0', background: form.role === r.label ? r.color : 'transparent' }}
                      animate={{ scale: form.role === r.label ? 1 : 0.85 }}>
                      {form.role === r.label && <RiCheckLine className="w-3 h-3 text-white" />}
                    </motion.div>
                  </motion.button>
                ))}

                <p className="text-xs text-slate-400 text-center pt-2">
                  You can invite teammates with different roles from Settings after setup.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <motion.button whileHover={{ x: -2 }} onClick={goBack}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-2 rounded-xl hover:bg-slate-100">
                <RiArrowLeftLine className="w-4 h-4" /> Back
              </motion.button>
            ) : <div />}

            {step < 3 ? (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={goNext}
                disabled={!canProceed}
                className="flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: canProceed ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : '#E2E8F0', boxShadow: canProceed ? '0 4px 16px rgba(99,102,241,0.35)' : 'none', color: canProceed ? 'white' : '#94A3B8' }}>
                Continue <RiArrowRightLine className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit} disabled={loading || !canProceed}
                className="flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
                {loading ? (
                  <>
                    <motion.span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                    Creating…
                  </>
                ) : (
                  <> Create Account <RiArrowRightLine className="w-4 h-4" /></>
                )}
              </motion.button>
            )}
          </div>

          <p className="text-sm text-slate-400 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign in</Link>
          </p>
          <p className="text-xs text-slate-300 text-center mt-3">
            By creating an account you agree to our{' '}
            <a href="#" className="text-indigo-400 hover:underline">Terms</a> and{' '}
            <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}