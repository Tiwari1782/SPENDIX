import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ForecastChart({ snapshots = [], forecasts = [], toolName = '' }) {
  const historical = snapshots.map(s => ({
    month: s.snapshot_month?.substring(0, 7),
    actual: parseFloat(s.actual_spend),
    type: 'actual'
  }));

  const projected = forecasts.map(f => ({
    month: f.forecast_month?.substring(0, 7),
    projected: parseFloat(f.projected_spend),
    type: 'projected'
  }));

  // Combine: last actual point bridges into projected
  const data = [...historical];
  if (historical.length > 0 && projected.length > 0) {
    const lastActual = historical[historical.length - 1];
    projected[0] = { ...projected[0], actual: lastActual.actual };
  }
  data.push(...projected);

  const dividerMonth = historical.length > 0 ? historical[historical.length - 1].month : null;

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <h3 className="font-semibold text-text-primary mb-4">{toolName} — Spend Trend & Forecast</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(v) => [`₹${v?.toLocaleString('en-IN')}`, '']} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
          {dividerMonth && <ReferenceLine x={dividerMonth} stroke="#94A3B8" strokeDasharray="5 5" label={{ value: 'Forecast →', position: 'top', fontSize: 11, fill: '#64748B' }} />}
          <Area type="monotone" dataKey="actual" stroke="#6366F1" strokeWidth={2} fill="url(#actualGrad)" dot={{ r: 3, fill: '#6366F1' }} />
          <Area type="monotone" dataKey="projected" stroke="#F59E0B" strokeWidth={2} strokeDasharray="8 4" fill="url(#projGrad)" dot={{ r: 3, fill: '#F59E0B' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
