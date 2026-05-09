// src/components/Pagination.js
import clsx from 'clsx';

export default function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >← Prev</button>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={clsx(
              'w-7 h-7 text-xs rounded font-medium',
              p === page ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >Next →</button>
      </div>
    </div>
  );
}
