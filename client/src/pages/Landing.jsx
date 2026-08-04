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