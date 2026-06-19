import { RiAddLine, RiCloseLine } from 'react-icons/ri';

export default function ShadowITTable({ invoices, onAdd, onIgnore }) {
  if (!invoices?.length) return <div className="text-center py-8 text-text-muted">No shadow IT discovered yet</div>;
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th className="px-4 py-3 font-semibold text-text-muted">Tool Name</th>
            <th className="px-4 py-3 font-semibold text-text-muted">Amount</th>
            <th className="px-4 py-3 font-semibold text-text-muted">Seats</th>
            <th className="px-4 py-3 font-semibold text-text-muted">Renewal Date</th>
            <th className="px-4 py-3 font-semibold text-text-muted">Status</th>
            <th className="px-4 py-3 font-semibold text-text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id} className="border-t border-border hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3 font-medium">{inv.parsed_tool_name}</td>
              <td className="px-4 py-3">₹{parseFloat(inv.parsed_amount || 0).toLocaleString('en-IN')}</td>
              <td className="px-4 py-3">{inv.parsed_seats || '—'}</td>
              <td className="px-4 py-3">{inv.parsed_renewal_date || '—'}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${inv.status === 'pending_review' ? 'bg-warning/10 text-warning' : inv.status === 'added_to_stack' ? 'bg-success/10 text-success' : 'bg-slate-100 text-text-muted'}`}>
                  {inv.status === 'pending_review' ? 'Pending' : inv.status === 'added_to_stack' ? 'Added' : 'Ignored'}
                </span>
              </td>
              <td className="px-4 py-3">
                {inv.status === 'pending_review' && (
                  <div className="flex gap-2">
                    <button onClick={() => onAdd(inv.id)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 font-medium"><RiAddLine />Add</button>
                    <button onClick={() => onIgnore(inv.id)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-slate-100 text-text-muted rounded-lg hover:bg-slate-200 font-medium"><RiCloseLine />Ignore</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
