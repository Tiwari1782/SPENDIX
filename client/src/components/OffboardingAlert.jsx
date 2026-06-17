import { motion } from 'framer-motion';
import { RiAlertLine } from 'react-icons/ri';

export default function OffboardingAlert({ risk, onResolve, index = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.05 }} layout
      className="bg-white rounded-xl border border-danger/20 p-4 shadow-sm hover:border-danger/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
            <RiAlertLine className="text-danger" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{risk.employee_name}</h3>
            <p className="text-sm text-text-muted">{risk.department} • Left {risk.deactivated_at}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-danger font-bold">₹{parseFloat(risk.monthly_risk_cost || 0).toLocaleString('en-IN')}/mo</p>
          <p className="text-xs text-text-muted">{risk.active_tool_count} active tools</p>
        </div>
      </div>
      {risk.tools && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {risk.tools.map((t, i) => (
            <span key={i} className="text-[11px] px-2 py-0.5 bg-slate-100 text-text-muted rounded-full">{t}</span>
          ))}
        </div>
      )}
      {onResolve && (
        <button onClick={() => onResolve(risk.employee_id)} className="mt-3 text-sm font-medium text-white bg-danger hover:bg-red-600 px-4 py-2 rounded-lg transition-colors">
          Resolve — Revoke All
        </button>
      )}
    </motion.div>
  );
}
