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
