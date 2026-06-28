import { motion } from 'framer-motion';

const sizes = { sm: 32, md: 48, lg: 64 };

function SpendixLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stylized stacked bar chart in indigo */}
      <rect x="8" y="28" width="8" height="14" rx="2" fill="#6366F1" opacity="0.6" />
      <rect x="20" y="18" width="8" height="24" rx="2" fill="#6366F1" opacity="0.8" />
      <rect x="32" y="8" width="8" height="34" rx="2" fill="#6366F1" />
      {/* Upward trend line */}
      <path d="M10 26 L24 16 L38 6" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="38" cy="6" r="2.5" fill="#4F46E5" />
    </svg>
  );
}

export default function SpendixLoader({ size = 'md', fullPage = false }) {
  const px = sizes[size] || sizes.md;

  const loader = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative" style={{ width: px + 24, height: px + 24 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <SpendixLogo size={px} />
        </div>
        <motion.svg
          width={px + 24}
          height={px + 24}
          viewBox="0 0 72 72"
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        >
          <circle
            cx="36" cy="36" r="33"
            stroke="#E2E8F0" strokeWidth="2.5" fill="none"
          />
          <motion.circle
            cx="36" cy="36" r="33"
            stroke="#6366F1" strokeWidth="2.5" fill="none"
            strokeLinecap="round"
            strokeDasharray="207"
            strokeDashoffset="155"
          />
        </motion.svg>
      </div>
      {fullPage && (
        <p className="text-text-muted text-sm font-medium">Loading Spendix...</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
}
