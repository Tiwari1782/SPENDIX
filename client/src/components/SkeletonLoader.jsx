export function SkeletonCard() {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-border animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-8 w-8 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-8 w-32 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-20 bg-slate-200 rounded" />
      </div>
    );
  }
  
  export function SkeletonRow() {
    return (
      <tr className="animate-pulse">
        {[...Array(6)].map((_, i) => (
          <td key={i} className="px-4 py-3">
            <div className="h-4 bg-slate-200 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
          </td>
        ))}
      </tr>
    );
  }
  
  export function SkeletonTable({ cols = 6, rows = 5 }) {
    return (
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 flex gap-4 animate-pulse">
          {[...Array(cols)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded flex-1" />
          ))}
        </div>
        <table className="w-full">
          <tbody>
            {[...Array(rows)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
  }
  
  export function SkeletonChart() {
    return (
      <div className="bg-white rounded-xl p-5 border border-border animate-pulse">
        <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
        <div className="h-64 bg-slate-100 rounded-lg flex items-end gap-2 px-4 pb-4">
          {[40, 65, 50, 80, 55, 70, 45, 75, 60, 85].map((h, i) => (
            <div key={i} className="flex-1 bg-slate-200 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }
  
  export function SkeletonBadge() {
    return <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse inline-block" />;
  }
  
  export function SkeletonText({ lines = 3, className = '' }) {
    return (
      <div className={`space-y-2 animate-pulse ${className}`}>
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
        ))}
      </div>
    );
  }
  