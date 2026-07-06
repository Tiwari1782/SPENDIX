import { motion } from 'framer-motion';
import { RiCheckLine, RiTimeLine, RiAlertLine } from 'react-icons/ri';

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  in_progress: 'bg-accent/10 text-accent border-accent/20',
  completed: 'bg-success/10 text-success border-success/20',
};

export default function WorkflowTracker({ instance, onClick }) {
  const progress = instance.total_tasks > 0 ? Math.round((instance.completed_tasks / instance.total_tasks) * 100) : 0;
  const isOverdue = instance.status === 'pending' && instance.total_tasks > 0;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      onClick={onClick} className="bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md cursor-pointer transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[instance.status] || statusColors.pending}`}>
          {instance.trigger_type}
        </span>
        {isOverdue && <RiAlertLine className="text-danger" size={16} />}
      </div>
      <h3 className="font-semibold text-sm text-text-primary mb-1">{instance.employee_name}</h3>
      <p className="text-xs text-text-muted mb-3">{instance.department}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-success' : 'bg-accent'}`} style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-medium text-text-muted">{instance.completed_tasks}/{instance.total_tasks}</span>
      </div>
    </motion.div>
  );
}
