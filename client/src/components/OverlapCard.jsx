import { motion } from 'framer-motion';
import { RiLightbulbLine } from 'react-icons/ri';

export default function OverlapCard({ group, index = 0 }) {
  const tools = typeof group.tool_ids === 'string' ? JSON.parse(group.tool_ids) : (group.tool_ids || []);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold px-2.5 py-1 bg-accent/10 text-accent rounded-full capitalize">{group.category?.replace('_', ' ')}</span>
        <span className="text-sm font-medium text-danger">₹{parseFloat(group.combined_monthly_cost || 0).toLocaleString('en-IN')}/mo</span>
      </div>
      <p className="text-sm text-text-muted mb-3">{tools.length} overlapping tools in this category</p>
      {group.recommendation && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
          <div className="flex items-start gap-2">
            <RiLightbulbLine className="text-warning mt-0.5 shrink-0" size={16} />
            <p className="text-sm text-text-primary leading-relaxed">{group.recommendation}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
