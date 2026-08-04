import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import {
  RiShieldCheckLine, RiMoneyDollarCircleLine, RiTeamLine, RiSpyLine,
  RiLineChartLine, RiCalendarEventLine, RiStackLine, RiFlowChart,
  RiFilePaper2Line, RiBarChartGroupedLine, RiPlugLine, RiCheckLine,
  RiArrowRightLine, RiFireLine, RiAlertLine, RiCloseLine,
  RiMenu3Line, RiStarLine, RiArrowUpLine, RiGlobalLine,
  RiShieldUserLine, RiLockPasswordLine, RiBuilding2Line,
  RiTrophyLine, RiTimeLine
} from 'react-icons/ri';
import { SiGoogle, SiSlack, SiJira, SiRazorpay } from 'react-icons/si';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};
const stagger = (delay = 0.08) => ({
  visible: { transition: { staggerChildren: delay } }
});
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

/* ─── Animated Counter ─── */
function CountUp({ end, prefix = '', suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const raf = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(end * ease));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [inView, end, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>;
}

/* ─── Section wrapper ─── */
function Section({ children, className = '', id = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      id={id} ref={ref}
      initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={stagger()}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Features ─── */
const features = [
  { icon: RiMoneyDollarCircleLine, title: 'License Waste Detection', desc: 'Auto-detect idle seats unused for 60+ days. Flag wasted spend down to the rupee per employee.', color: '#EF4444', bg: '#FEF2F2' },
  { icon: RiSpyLine, title: 'Shadow IT Discovery', desc: 'Parse forwarded invoices with Groq AI. Surface unapproved tools before they become a compliance risk.', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: RiCalendarEventLine, title: 'Renewal Alerts', desc: 'Get 90/60/30-day alerts per tool with auto-renewal flags, vendor contacts, and one-click escalation.', color: '#F59E0B', bg: '#FFFBEB' },
  { icon: RiTeamLine, title: 'Offboarding Risk', desc: 'Cross-reference departed employees against active SaaS licenses. Revoke access in one click.', color: '#EF4444', bg: '#FEF2F2' },
  { icon: RiStackLine, title: 'Tool Overlap Detection', desc: 'AI classifies every tool by category and surfaces redundant pairs — Zoom + Meet, Jira + Asana.', color: '#6366F1', bg: '#EEF2FF' },
  { icon: RiLineChartLine, title: 'Spend Forecasting', desc: 'Groq-powered 3-month projections based on historical snapshots. Catch overages before they happen.', color: '#10B981', bg: '#ECFDF5' },
  { icon: RiFlowChart, title: 'Provisioning Workflows', desc: 'Auto-generate onboarding and offboarding checklists tailored to each employee\'s role and tools.', color: '#6366F1', bg: '#EEF2FF' },
  { icon: RiFilePaper2Line, title: 'Contract Intelligence', desc: 'Upload vendor PDFs. AI extracts escalation clauses, notice periods, and cancellation penalties instantly.', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: RiBarChartGroupedLine, title: 'Peer Benchmarks', desc: 'Compare your spend-per-employee against industry medians. Know exactly when you\'re overpaying.', color: '#10B981', bg: '#ECFDF5' },
  { icon: RiPlugLine, title: 'Native Integrations', desc: 'Connect Google Workspace, Zoho Books, Razorpay, Slack, and Jira for real-time sync.', color: '#F59E0B', bg: '#FFFBEB' },
  { icon: RiShieldCheckLine, title: 'Role-Based Access', desc: 'IT admins, finance heads, and dept leads each see exactly their slice. Zero information leakage.', color: '#6366F1', bg: '#EEF2FF' },
];

/* ─── Pricing ─── */
const pricing = [
  {
    name: 'Starter', price: '₹4,999', period: '/month', badge: null,
    features: ['Up to 100 employees', '5 SaaS tools tracked', 'License waste detection', 'Renewal alerts (email)', 'Shadow IT discovery', 'Email support'],
    highlight: false
  },
  {
    name: 'Growth', price: '₹12,999', period: '/month', badge: 'Most Popular',
    features: ['Up to 500 employees', 'Unlimited tools', 'Everything in Starter', 'Tool overlap detection', 'Spend forecasting', 'Provisioning workflows', 'Slack alerts', 'Priority support'],
    highlight: true
  },
  {
    name: 'Enterprise', price: 'Custom', period: '', badge: null,
    features: ['Unlimited employees', 'Everything in Growth', 'Contract intelligence', 'Peer benchmarks', 'SSO & API access', 'Dedicated CSM', 'SLA guarantee'],
    highlight: false
  },
];

/* ─── Testimonials ─── */
const testimonials = [
  { name: 'Priya Sharma', title: 'Head of IT, FinStack India', avatar: 'PS', review: 'Spendix found ₹2.1L in unused Salesforce seats in the first week. The ROI paid for itself in 11 days. Nothing else in the market comes close for our team size.', stars: 5 },
  { name: 'Rohan Mehta', title: 'CFO, Kirana Kart', avatar: 'RM', review: 'We had 3 ex-employees with active admin access to Razorpay and our CRM. Spendix flagged it the moment we connected. That alone was worth every rupee.', stars: 5 },
  { name: 'Deepa Nair', title: 'VP Operations, BuildDesk', avatar: 'DN', review: 'The contract intelligence feature is genuinely impressive. It parsed our Salesforce renewal PDF and caught a 15% annual escalation clause we had completely missed.', stars: 5 },
];
/* ─── Comparison ─── */
const compTable = [
    { feature: 'License waste detection',   spendix: true,  zylo: true,  zluri: true,  torii: true  },
    { feature: 'Shadow IT discovery',       spendix: true,  zylo: true,  zluri: true,  torii: true  },
    { feature: 'Contract renewal alerts',   spendix: true,  zylo: true,  zluri: true,  torii: true  },
    { feature: 'Tool overlap detection',    spendix: true,  zylo: true,  zluri: false, torii: false },
    { feature: 'Spend forecasting',         spendix: true,  zylo: true,  zluri: false, torii: false },
    { feature: 'Contract PDF intelligence', spendix: true,  zylo: false, zluri: false, torii: false },
    { feature: 'Peer benchmarking',         spendix: true,  zylo: true,  zluri: false, torii: false },
    { feature: 'Groq AI invoice parsing',   spendix: true,  zylo: false, zluri: false, torii: false },
    { feature: 'Pricing for Indian SMEs',   spendix: true,  zylo: false, zluri: false, torii: false },
  ];
  
  /* ─── How It Works ─── */
  const steps = [
    { step: '01', title: 'Connect your stack', desc: 'Link Google Workspace, Zoho Books, or upload a CSV. Spendix syncs your tool inventory in minutes.', icon: RiPlugLine },
    { step: '02', title: 'AI scans everything', desc: 'Groq AI categorizes tools, detects overlap, parses invoices, and identifies waste across every seat.', icon: RiSpyLine },
    { step: '03', title: 'Resolve and save', desc: 'Act on AI recommendations with one click. Revoke access, trigger renewals, or consolidate tools.', icon: RiTrophyLine },
  ];
  
  /* ─── Main Component ─── */
  export default function Landing() {
    const [navScrolled, setNavScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 500], [0, -60]);
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  
    useEffect(() => {
      return scrollY.on('change', v => setNavScrolled(v > 20));
    }, [scrollY]);
  
    return (
      <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
  
        {/* ── NAV ── */}
        <motion.nav
          className="fixed top-0 w-full z-50 transition-all duration-300"
          style={{ background: navScrolled ? 'rgba(255,255,255,0.95)' : 'transparent', backdropFilter: navScrolled ? 'blur(20px)' : 'none', borderBottom: navScrolled ? '1px solid #E2E8F0' : 'none' }}
        >
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                <rect x="6" y="28" width="9" height="14" rx="2.5" fill="#6366F1" opacity="0.5"/>
                <rect x="19" y="17" width="9" height="25" rx="2.5" fill="#6366F1" opacity="0.75"/>
                <rect x="32" y="6" width="9" height="36" rx="2.5" fill="#6366F1"/>
              </svg>
              <span className="text-xl font-bold text-slate-900" style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.01em' }}>Spendix</span>
            </div>
  
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
              {['Features', 'How It Works', 'Pricing', 'Integrations'].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} className="hover:text-slate-900 transition-colors">{l}</a>
              ))}
            </div>
  
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all">Log in</Link>
              <Link to="/signup" className="flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                Start Free Trial <RiArrowRightLine className="w-4 h-4" />
              </Link>
            </div>
  
            <button className="md:hidden text-slate-600 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <RiCloseLine className="w-5 h-5" /> : <RiMenu3Line className="w-5 h-5" />}
            </button>
          </div>
  
          <AnimatePresence>
            {mobileOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
                {['Features', 'How It Works', 'Pricing', 'Integrations'].map(l => (
                  <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileOpen(false)}
                    className="block text-sm font-medium text-slate-600 py-2">{l}</a>
                ))}
                <Link to="/signup" className="block text-center text-sm font-semibold text-white py-3 rounded-xl mt-2"
                  style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}>
                  Start Free Trial
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
  
        {/* ── HERO ── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-16"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%), linear-gradient(180deg, #0F172A 0%, #1E1B4B 40%, #0F172A 100%)' }}>
  
          {/* Animated grid bg */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
  
          {/* Floating orbs */}
          <motion.div className="absolute top-1/4 left-1/5 w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }}
            animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute bottom-1/4 right-1/5 w-48 h-48 rounded-full opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }}
            animate={{ scale: [1.2, 1, 1.2], x: [0, -15, 0], y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
  
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto">
  
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-8 border"
            style={{ background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.3)', color: '#A5B4FC' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SaaS Intelligence built for Indian mid-market companies
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}>
            <TypeAnimation
              sequence={[
                'Stop overpaying for SaaS.', 2200,
                'Find your wasted licenses.', 2200,
                'Eliminate shadow IT.', 2200,
                'Never miss a renewal.', 2200,
              ]}
              wrapper="span" speed={55} repeat={Infinity} className="text-white"
            />
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#94A3B8' }}>
            Spendix gives Indian companies complete visibility into their SaaS spend — detect waste, discover shadow IT, forecast costs, and never auto-renew by accident.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/signup"
              className="group flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', boxShadow: '0 8px 32px rgba(99,102,241,0.45)' }}>
              Start Free Trial
              <motion.span className="group-hover:translate-x-1 transition-transform"><RiArrowRightLine className="w-5 h-5" /></motion.span>
            </Link>
            <a href="#features"
              className="flex items-center gap-2 font-semibold px-8 py-4 rounded-2xl text-base transition-all border"
              style={{ color: '#CBD5E1', borderColor: 'rgba(203,213,225,0.2)', background: 'rgba(255,255,255,0.05)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              See all features
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-14">
            {[{ val: '200+', label: 'companies' }, { val: '₹18Cr+', label: 'waste found' }, { val: '98%', label: 'retention' }].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-white font-bold text-base">{s.val}</span>
                <span style={{ color: '#64748B' }} className="text-sm">{s.label}</span>
                {i < 2 && <span className="w-px h-4 bg-slate-700 ml-2" />}
              </div>
            ))}
          </motion.div>

          {/* Dashboard preview mockup */}
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto rounded-2xl overflow-hidden"
            style={{ maxWidth: 860, boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2)' }}>

            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3" style={{ background: '#1E293B', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-amber-400 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-80" />
              <div className="flex-1 mx-4 h-6 rounded-md text-xs flex items-center px-3" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                app.spendix.in/dashboard
              </div>
            </div>

            {/* Fake dashboard */}
            <div style={{ background: '#F8FAFC' }} className="p-4">
              <div className="flex gap-3 mb-3">
                {[
                  { label: 'Monthly Spend', val: '₹4,11,500', color: '#6366F1', delta: '-4%' },
                  { label: 'Wasted',         val: '₹1,42,050', color: '#EF4444', delta: '+12%' },
                  { label: 'Annual Savings', val: '₹17,04,600', color: '#10B981', delta: null },
                ].map((c, i) => (
                  <div key={i} className="flex-1 bg-white rounded-xl p-3 border border-slate-100"
                    style={{ borderTop: `3px solid ${c.color}` }}>
                    <p className="text-xs text-slate-400 mb-1">{c.label}</p>
                    <p className="text-base font-bold text-slate-900">{c.val}</p>
                    {c.delta && (
                      <span className="text-xs font-medium" style={{ color: c.delta.startsWith('-') ? '#10B981' : '#EF4444' }}>{c.delta} vs last mo</span>
                    )}
                  </div>
                ))}
              </div>