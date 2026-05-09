// app/(dashboard)/salons/page.js
'use client';
import { useState, memo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { useAdminSalons, useVerifySalon, useSuspendSalon, useUnsuspendSalon } from '@/hooks/useSalons';
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/DataTable';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import Confirm from '@/components/Confirm';
import { Building2, CheckCircle, XCircle, Eye, Filter, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

const SalonRow = memo(({ salon, router, onConfirmAction }) => (
  <Tr onClick={() => router.push(`/dashboard/salons/${salon.id}`)}>
    <Td>
      <div>
        <p className="font-medium text-gray-900 flex items-center gap-1.5">
          {salon.name}
          {salon.isVerified && <span className="text-green-500 text-xs">✓</span>}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{salon.phone}</p>
      </div>
    </Td>
    <Td className="text-gray-600">{salon.city}</Td>
    <Td>
      <Badge
        label={salon.gender === 'UNISEX' ? '👥 Unisex' : salon.gender === 'FEMALE' ? '👩 Ladies' : '👨 Gents'}
        variant={salon.gender}
      />
    </Td>
    <Td><Badge label={salon.plan} variant={salon.plan} /></Td>
    <Td>
      <span className="flex items-center gap-1">
        <span className="text-amber-400">⭐</span>
        <span className="font-medium">{salon.avgRating?.toFixed(1) || '—'}</span>
        <span className="text-gray-400 text-xs">({salon.totalReviews})</span>
      </span>
    </Td>
    <Td className="font-medium">{salon._count?.bookings ?? 0}</Td>
    <Td>
      <Badge
        label={salon.isVerified ? 'Verified' : salon.isActive ? 'Pending' : 'Suspended'}
        variant={salon.isVerified ? 'VERIFIED' : salon.isActive ? 'PENDING_VER' : 'SUSPENDED'}
      />
    </Td>
    <Td className="text-gray-400">{format(new Date(salon.createdAt), 'dd MMM yy')}</Td>
    <Td>
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => router.push(`/dashboard/salons/${salon.id}`)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          title="View"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        {!salon.isVerified && salon.isActive && (
          <button
            onClick={() => onConfirmAction({ id: salon.id, action: 'verify', name: salon.name })}
            className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
            title="Verify"
          >
            <CheckCircle className="w-3.5 h-3.5" />
          </button>
        )}
        {salon.isActive ? (
          <button
            onClick={() => onConfirmAction({ id: salon.id, action: 'suspend', name: salon.name })}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
            title="Suspend"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onConfirmAction({ id: salon.id, action: 'unsuspend', name: salon.name })}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
            title="Unsuspend"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </Td>
  </Tr>
));

export default function SalonsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(sp.get('verified') ?? 'all'); // 'all' | 'true' | 'false'
  const [confirm, setConfirm] = useState(null); // { id, action: 'verify' | 'suspend' | 'unsuspend', name }

  const params = {
    page, limit: 20,
    search: search || undefined,
    verified: filter === 'all' ? undefined : filter,
  };

  const { data, isLoading } = useAdminSalons(params);
  const { mutateAsync: verify, isPending: verifying } = useVerifySalon();
  const { mutateAsync: suspend, isPending: suspending } = useSuspendSalon();
  const { mutateAsync: unsuspend, isPending: unsuspending } = useUnsuspendSalon();

  const salons = data?.salons ?? [];
  const total = data?.total ?? 0;

  const handleAction = async () => {
    if (!confirm) return;
    if (confirm.action === 'verify') await verify(confirm.id);
    if (confirm.action === 'suspend') await suspend(confirm.id);
    if (confirm.action === 'unsuspend') await unsuspend(confirm.id);
    setConfirm(null);
  };

  const FILTERS = [
    { key: 'all', label: 'All Salons' },
    { key: 'true', label: 'Verified' },
    { key: 'false', label: 'Pending' },
  ];

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-600" /> Salons
        </h2>
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search salons..." />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={clsx(
              'px-4 py-1.5 text-xs font-semibold rounded-lg transition-all',
              filter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <Thead>
            <Th>Salon</Th>
            <Th>City</Th>
            <Th>Type</Th>
            <Th>Plan</Th>
            <Th>Rating</Th>
            <Th>Bookings</Th>
            <Th>Status</Th>
            <Th>Joined</Th>
            <Th>Actions</Th>
          </Thead>
          <Tbody>
            {isLoading
              ? [...Array(8)].map((_, i) => (
                <Tr key={i}>
                  {[...Array(9)].map((_, j) => (
                    <Td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></Td>
                  ))}
                </Tr>
              ))
              : salons.map(salon => (
                <SalonRow key={salon.id} salon={salon} router={router} onConfirmAction={setConfirm} />
              ))
            }
          </Tbody>
        </Table>
        <Pagination page={page} total={total} limit={20} onChange={setPage} />
      </div>

      <Confirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        title={confirm?.action === 'verify' ? 'Verify Salon' : confirm?.action === 'suspend' ? 'Suspend Salon' : 'Unsuspend Salon'}
        message={
          confirm?.action === 'verify'
            ? `Verify "${confirm?.name}"? It will become visible to customers.`
            : confirm?.action === 'suspend'
              ? `Suspend "${confirm?.name}"? It will be hidden from customers immediately.`
              : `Unsuspend "${confirm?.name}"? It will become active again.`
        }
        confirmLabel={confirm?.action === 'verify' ? 'Verify' : confirm?.action === 'suspend' ? 'Suspend' : 'Unsuspend'}
        danger={confirm?.action === 'suspend'}
        loading={verifying || suspending || unsuspending}
      />
    </div>
  );
}
