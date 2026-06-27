import { motion } from 'framer-motion';

const colorMap = {
  indigo: { bg: 'bg-accent/10', border: 'border-l-accent', text: 'text-accent' },
  red: { bg: 'bg-danger/10', border: 'border-l-danger', text: 'text-danger' },
  emerald: { bg: 'bg-success/10', border: 'border-l-success', text: 'text-success' },
  amber: { bg: 'bg-warning/10', border: 'border-l-warning', text: 'text-warning' },
};

export default function SummaryCard({ title, value, color = 'indigo', icon: Icon, prefix = '' }) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
      className={`bg-white rounded-xl p-5 border border-border border-l-4 ${c.border} shadow-sm cursor-default transition-shadow`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-text-muted">{title}</p>
        {Icon && <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}><Icon size={18} className={c.text} /></div>}
      </div>
      <p className={`text-2xl font-bold ${c.text}`}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
    </motion.div>
  );
}
