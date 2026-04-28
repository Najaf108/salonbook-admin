'use client';
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useCommissionReport, useSettleCommissions, useCommissionBreakdown } from '@/hooks/useCommissions';
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/DataTable';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';
import Confirm from '@/components/Confirm';
import { DollarSign, TrendingUp, Clock, CheckCircle, Store, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export default function CommissionsPage() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(0); // 0 = current, 1 = last, 2 = two months ago
  const [statusFilter, setStatusFilter] = useState('all');
  const [settleConfirm, setSettleConfirm] = useState(false);

  const now = new Date();
  const targetMonth = subMonths(now, month);
  const startDate = format(startOfMonth(targetMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(targetMonth), 'yyyy-MM-dd');

  const params = { startDate, endDate, status: statusFilter === 'all' ? undefined : statusFilter, page, limit: 20 };
  const { data, isLoading } = useCommissionReport(params);
  const { data: breakdown, isLoading: loadingBreakdown } = useCommissionBreakdown();
  const { mutateAsync: settle, isPending: settling } = useSettleCommissions();

  const commissions = data?.commissions ?? [];
  const total = data?.total ?? 0;

  const handleSettleAll = async () => {
    await settle({ startDate, endDate });
    setSettleConfirm(false);
  };

  const totalOwedFromCOD = breakdown?.reduce((sum, s) => sum + s.codPlatformFee, 0) ?? 0;

  const MONTHS = [
    { label: format(now, 'MMMM yyyy'), val: 0 },
    { label: format(subMonths(now, 1), 'MMMM yyyy'), val: 1 },
    { label: format(subMonths(now, 2), 'MMMM yyyy'), val: 2 },
  ];

  return (
    <div className="space-y-4 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" /> Commissions
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSettleConfirm(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Settle All Pending
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('transactions')}
          className={clsx(
            'pb-3 text-sm font-medium transition-all px-2',
            activeTab === 'transactions' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'
          )}
        >
          Recent Transactions
        </button>
        <button
          onClick={() => setActiveTab('salons')}
          className={clsx(
            'pb-3 text-sm font-medium transition-all px-2 flex items-center gap-2',
            activeTab === 'salons' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'
          )}
        >
          Salon Breakdown
          {totalOwedFromCOD > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              Payable
            </span>
          )}
        </button>
      </div>

      {activeTab === 'transactions' ? (
        <>
          {/* Month selector */}
          <div className="flex gap-2">
            {MONTHS.map(m => (
              <button
                key={m.val}
                onClick={() => { setMonth(m.val); setPage(1); }}
                className={clsx(
                  'px-4 py-2 text-xs font-semibold rounded-xl border transition-all',
                  month === m.val ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Summary Cards */}
          {!isLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                label="Total Commission"
                value={`PKR ${(data?.total_amount ?? 0).toLocaleString()}`}
                sub="For selected period"
                bg="bg-purple-50"
              />
              <SummaryCard
                icon={<Clock className="w-5 h-5 text-amber-600" />}
                label="Pending"
                value={`PKR ${(data?.pending ?? 0).toLocaleString()}`}
                sub={`${commissions.filter(c => c.status === 'PENDING').length} bookings`}
                bg="bg-amber-50"
              />
              <SummaryCard
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                label="Settled"
                value={`PKR ${(data?.settled ?? 0).toLocaleString()}`}
                sub="Paid out"
                bg="bg-green-50"
              />
              <SummaryCard
                icon={<DollarSign className="w-5 h-5 text-blue-600" />}
                label="Avg per Booking"
                value={commissions.length ? `PKR ${Math.round(data?.total_amount / commissions.length).toLocaleString()}` : '—'}
                bg="bg-blue-50"
              />
            </div>
          )}

          {/* Status filter */}
          <div className="flex gap-2">
            {['all', 'PENDING', 'SETTLED'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={clsx(
                  'px-3 py-1.5 text-xs font-semibold rounded-full border transition-all',
                  statusFilter === s ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                )}
              >
                {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <Thead>
                <Th>Booking Ref</Th><Th>Salon</Th><Th>Customer</Th>
                <Th>Booking Date</Th><Th>Booking Total</Th>
                <Th>Commission</Th><Th>Status</Th><Th>Settled On</Th>
              </Thead>
              <Tbody>
                {isLoading
                  ? [...Array(8)].map((_, i) => (
                    <Tr key={i}>
                      {[...Array(8)].map((_, j) => (
                        <Td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></Td>
                      ))}
                    </Tr>
                  ))
                  : commissions.map(c => (
                    <Tr key={c.id}>
                      <Td>
                        <span className="font-mono text-xs text-gray-500">
                          #{c.bookingId?.slice(0, 8).toUpperCase()}
                        </span>
                      </Td>
                      <Td className="font-medium text-gray-800">{c.booking?.salon?.name}</Td>
                      <Td className="text-gray-600">{c.booking?.customer?.name}</Td>
                      <Td className="text-gray-400 text-xs">
                        {format(new Date(c.booking?.scheduledAt ?? c.createdAt), 'dd MMM yy')}
                      </Td>
                      <Td className="text-gray-700">PKR {c.booking?.totalAmount?.toLocaleString()}</Td>
                      <Td className="font-semibold text-green-600">PKR {c.amount?.toLocaleString()}</Td>
                      <Td><Badge label={c.status} variant={c.status} /></Td>
                      <Td className="text-gray-400 text-xs">
                        {c.settledAt ? format(new Date(c.settledAt), 'dd MMM yy') : '—'}
                      </Td>
                    </Tr>
                  ))
                }
              </Tbody>
            </Table>
            <Pagination page={page} total={total} limit={20} onChange={setPage} />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SummaryCard
              icon={<Store className="w-5 h-5 text-blue-600" />}
              label="Total Salons"
              value={breakdown?.length || 0}
              bg="bg-blue-50"
            />
            <SummaryCard
              icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
              label="Total Owed (COD)"
              value={`PKR ${totalOwedFromCOD.toLocaleString()}`}
              sub="Held by salons (Cash bookings)"
              bg="bg-amber-50"
            />
            <SummaryCard
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Ready for Settlement"
              value={breakdown?.filter(s => s.codPlatformFee > 0).length || 0}
              sub="Salons with cash dues"
              bg="bg-green-50"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <Thead>
                <Th>Salon Name</Th><Th>City</Th><Th>Comm. Rate</Th>
                <Th>Total Gross</Th><Th>Total Fees</Th><Th>Owed (COD Only)</Th>
                <Th>Contact</Th>
              </Thead>
              <Tbody>
                {loadingBreakdown ? (
                  [...Array(5)].map((_, i) => (
                    <Tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <Td key={j}><div className="h-4 bg-gray-50 rounded animate-pulse" /></Td>
                      ))}
                    </Tr>
                  ))
                ) : breakdown?.map(salon => (
                  <Tr key={salon.id}>
                    <Td className="font-semibold text-gray-900">{salon.name}</Td>
                    <Td className="text-gray-500 text-xs uppercase">{salon.city}</Td>
                    <Td className="text-gray-600 font-medium">{salon.commissionRate}%</Td>
                    <Td className="text-gray-700">PKR {salon.totalGross.toLocaleString()}</Td>
                    <Td className="text-gray-700">PKR {salon.totalPlatformFee.toLocaleString()}</Td>
                    <Td>
                      <span className={clsx("font-bold", salon.codPlatformFee > 0 ? "text-amber-600" : "text-gray-400")}>
                        PKR {salon.codPlatformFee.toLocaleString()}
                      </span>
                    </Td>
                    <Td>
                      <a
                        href={`tel:${salon.phone}`}
                        className="text-purple-600 font-bold text-xs flex items-center gap-1 hover:underline"
                      >
                        {salon.phone}
                      </a>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </div>
      )}

      <Confirm
        open={settleConfirm}
        onClose={() => setSettleConfirm(false)}
        onConfirm={handleSettleAll}
        title="Settle All Pending Commissions"
        message={`Mark all pending commissions for ${MONTHS[month].label} as settled? This will mark PKR ${(data?.pending ?? 0).toLocaleString()} as paid out.`}
        confirmLabel="Settle All"
        loading={settling}
      />
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, bg }) {
  return (
    <div className={clsx('rounded-xl p-4 border border-gray-100', bg)}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-medium text-gray-600">{label}</span></div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
