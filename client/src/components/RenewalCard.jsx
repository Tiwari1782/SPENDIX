import { motion } from 'framer-motion';
import { RiCalendarEventLine, RiRefreshLine } from 'react-icons/ri';

export default function RenewalCard({ renewal }) {
  const daysLeft = renewal.days_until_renewal ?? 0;
  const urgency = daysLeft <= 30 ? 'danger' : daysLeft <= 60 ? 'warning' : 'success';
  const colorMap = { danger: 'border-l-danger bg-danger-light/30', warning: 'border-l-warning bg-warning-light/30', success: 'border-l-success bg-success-light/30' };
  const textMap = { danger: 'text-danger', warning: 'text-warning', success: 'text-success' };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-border border-l-4 ${colorMap[urgency]} p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-text-primary">{renewal.tool_name}</h3>
          <p className="text-sm text-text-muted mt-0.5">{renewal.category}</p>
        </div>
        {renewal.auto_renewal && (
          <span className="text-[10px] font-semibold px-2 py-0.5 bg-accent/10 text-accent rounded-full flex items-center gap-1">
            <RiRefreshLine size={10} />Auto-renew
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <RiCalendarEventLine className={textMap[urgency]} size={16} />
        <span className="text-sm font-medium">{renewal.renewal_date}</span>
      </div>
      <p className={`text-lg font-bold ${textMap[urgency]}`}>
        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
      </p>
      <p className="text-sm text-text-muted mt-1">₹{renewal.total_monthly_cost?.toLocaleString('en-IN')}/month</p>
    </motion.div>
  );
}
