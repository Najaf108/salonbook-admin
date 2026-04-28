// src/components/StatCard.js
import clsx from 'clsx';

export default function StatCard({ label, value, sub, icon, trend, trendUp, color = 'purple' }) {
  const colors = {
    purple: 'bg-purple-600',
    green:  'bg-emerald-600',
    blue:   'bg-blue-600',
    amber:  'bg-amber-500',
    red:    'bg-red-500',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg', colors[color])}>
          {icon}
        </div>
        {trend != null && (
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full',
            trendUp ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'
          )}>
            {trendUp ? '↑' : '↓'} {trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
