import { useState } from 'react';
import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';

const statusColors = {
  healthy: 'bg-success/10 text-success',
  moderate: 'bg-warning/10 text-warning',
  high_waste: 'bg-danger/10 text-danger',
};

export default function ToolTable({ tools, onViewUnused, onEdit }) {
  const [sortKey, setSortKey] = useState('tool_name');
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter] = useState('');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = tools.filter(t => t.tool_name.toLowerCase().includes(filter.toLowerCase()) || (t.category || '').toLowerCase().includes(filter.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
    return sortDir === 'asc' ? String(av || '').localeCompare(String(bv || '')) : String(bv || '').localeCompare(String(av || ''));
  });

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <RiArrowUpLine size={14} className="inline ml-1" /> : <RiArrowDownLine size={14} className="inline ml-1" />;
  };

  const cols = [
    { key: 'tool_name', label: 'Tool Name' },
    { key: 'seats_purchased', label: 'Seats' },
    { key: 'active_users', label: 'Active' },
    { key: 'unused_seats', label: 'Unused' },
    { key: 'total_monthly_cost', label: 'Monthly Cost' },
    { key: 'monthly_waste', label: 'Monthly Waste' },
    { key: 'usage_percent', label: 'Usage %' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border">
        <input type="text" placeholder="Search tools..." value={filter} onChange={e => setFilter(e.target.value)} className="w-64 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              {cols.map(c => (
                <th key={c.key} onClick={() => handleSort(c.key)} className="px-4 py-3 font-semibold text-text-muted cursor-pointer hover:text-text-primary select-none whitespace-nowrap">
                  {c.label}<SortIcon col={c.key} />
                </th>
              ))}
              <th className="px-4 py-3 font-semibold text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(tool => (
              <tr key={tool.id} className="border-t border-border hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-text-primary">{tool.tool_name}</div>
                  {tool.category && <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-text-muted rounded-full">{tool.category}</span>}
                </td>
                <td className="px-4 py-3">{tool.seats_purchased}</td>
                <td className="px-4 py-3">{tool.active_users}</td>
                <td className="px-4 py-3">{tool.unused_seats}</td>
                <td className="px-4 py-3 font-medium">₹{tool.total_monthly_cost?.toLocaleString('en-IN')}</td>
                <td className={`px-4 py-3 font-medium ${tool.monthly_waste > 0 ? 'text-danger' : 'text-text-muted'}`}>
                  ₹{tool.monthly_waste?.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-16">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${tool.usage_percent}%` }} />
                    </div>
                    <span className="text-xs text-text-muted">{tool.usage_percent}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[tool.status]}`}>
                    {tool.status === 'high_waste' ? 'High Waste' : tool.status === 'moderate' ? 'Moderate' : 'Healthy'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {onEdit && <button onClick={() => onEdit(tool)} className="text-xs text-accent hover:underline">Edit</button>}
                    {onViewUnused && tool.unused_seats > 0 && (
                      <button onClick={() => onViewUnused(tool)} className="text-xs text-danger hover:underline ml-2">Unused</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <div className="text-center py-8 text-text-muted">No tools found</div>}
      </div>
    </div>
  );
}
