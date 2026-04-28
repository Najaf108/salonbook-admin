// src/components/DataTable.js
import clsx from 'clsx';

export function Table({ children, className }) {
  return (
    <div className={clsx('w-full overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-100">{children}</table>
    </div>
  );
}

export function Thead({ children }) {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className }) {
  return (
    <th className={clsx('px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide', className)}>
      {children}
    </th>
  );
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-gray-50 bg-white">{children}</tbody>;
}

export function Tr({ children, onClick, className }) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'transition-colors',
        onClick ? 'cursor-pointer hover:bg-purple-50' : 'hover:bg-gray-50',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className }) {
  return (
    <td className={clsx('px-4 py-3 text-sm text-gray-700 whitespace-nowrap', className)}>
      {children}
    </td>
  );
}
