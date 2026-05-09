// src/components/Badge.js
import clsx from 'clsx';

const variants = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-green-100  text-green-700  border-green-200',
  COMPLETED: 'bg-gray-100   text-gray-600   border-gray-200',
  CANCELLED: 'bg-red-100    text-red-600    border-red-200',
  NO_SHOW: 'bg-red-100    text-red-600    border-red-200',
  PAID: 'bg-green-100  text-green-700  border-green-200',
  UNPAID: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  REFUNDED: 'bg-blue-100   text-blue-600   border-blue-200',
  VERIFIED: 'bg-green-100  text-green-700  border-green-200',
  PENDING_VER: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  SUSPENDED: 'bg-red-100    text-red-600    border-red-200',
  BASIC: 'bg-gray-100   text-gray-600   border-gray-200',
  PRO: 'bg-blue-100   text-blue-600   border-blue-200',
  PREMIUM: 'bg-purple-100 text-purple-700 border-purple-200',
  ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
  CUSTOMER: 'bg-gray-100   text-gray-600   border-gray-200',
  SALON_OWNER: 'bg-blue-100   text-blue-600   border-blue-200',
  SETTLED: 'bg-green-100  text-green-700  border-green-200',
  STARTER: 'bg-gray-100   text-gray-600   border-gray-200',
  GROWTH: 'bg-blue-100   text-blue-600   border-blue-200',
  ENTERPRISE: 'bg-purple-100 text-purple-700 border-purple-200',
  ORG_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
  BRANCH_MANAGER: 'bg-blue-100 text-blue-600 border-blue-200',
  ACTIVE: 'bg-green-100  text-green-700  border-green-200',
  INACTIVE: 'bg-red-100    text-red-600    border-red-200',
  default: 'bg-gray-100   text-gray-600   border-gray-200',
};

export default function Badge({ label, variant, className }) {
  const cls = variants[variant] || variants.default;
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', cls, className)}>
      {label}
    </span>
  );
}
