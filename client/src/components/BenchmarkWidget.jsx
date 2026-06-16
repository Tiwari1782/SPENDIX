import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const comparisonColors = { below_median: '#10B981', between_median_p75: '#F59E0B', above_p75: '#EF4444', no_benchmark: '#94A3B8' };

export default function BenchmarkWidget({ category }) {
  if (!category?.benchmark) {
    return (
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <h3 className="font-semibold capitalize mb-2">{category?.category?.replace('_', ' ')}</h3>
        <p className="text-sm text-text-muted">Insufficient benchmark data (min 5 companies required)</p>
      </div>
    );
  }

  const data = [
    { label: 'Your Spend', value: category.spend_per_employee },
    { label: 'Median', value: category.benchmark.median_spend_per_employee },
    { label: 'Top 25%', value: category.benchmark.p75_spend_per_employee },
  ];

  const barColor = comparisonColors[category.comparison] || comparisonColors.no_benchmark;

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold capitalize">{category.category?.replace('_', ' ')}</h3>
          <p className="text-xs text-text-muted">{category.tool_count} tool(s) • {category.benchmark.sample_size} companies</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full`} style={{ backgroundColor: barColor + '20', color: barColor }}>
          ₹{category.spend_per_employee?.toLocaleString('en-IN')}/emp
        </span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} layout="vertical" margin={{ left: 50, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => `₹${v?.toLocaleString('en-IN')}`} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} width={60} />
          <Tooltip formatter={v => [`₹${v?.toLocaleString('en-IN')}`, 'Per Employee/Mo']} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => <Cell key={i} fill={i === 0 ? barColor : '#CBD5E1'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
