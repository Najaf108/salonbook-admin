// app/(dashboard)/bookings/page.js
'use client';
import { useState, memo, useCallback } from 'react';
import { format } from 'date-fns';
import { useAdminBookings, useAdminUpdateBookingStatus } from '@/hooks/useBookings';
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/DataTable';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import Modal from '@/components/Modal';
import { BookOpen, Phone } from 'lucide-react';
import clsx from 'clsx';

const STATUSES = [null, 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
const STATUS_LABELS = {
  null: 'All', PENDING: 'Pending', CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed', CANCELLED: 'Cancelled', NO_SHOW: 'No Show',
};

const BookingRow = memo(({ b, onSelect }) => (
  <Tr onClick={() => onSelect(b)}>
    <Td>
      <span className="font-mono text-xs text-gray-500">
        #{b.id.slice(0, 8).toUpperCase()}
      </span>
    </Td>
    <Td>
      <div>
        <p className="font-medium text-gray-800">{b.customer?.name}</p>
        <p className="text-xs text-gray-400">{b.customer?.phone}</p>
      </div>
    </Td>
    <Td>
      <div>
        <p className="font-medium text-gray-800">{b.salon?.name}</p>
        <p className="text-xs text-gray-400">{b.salon?.city}</p>
      </div>
    </Td>
    <Td className="text-gray-500 text-xs">
      {format(new Date(b.scheduledAt), 'dd MMM yy')}<br />
      {format(new Date(b.scheduledAt), 'h:mm a')}
    </Td>
    <Td className="max-w-[160px] truncate text-gray-500 text-xs">
      {b._count?.items ?? 0} service{(b._count?.items ?? 0) !== 1 ? 's' : ''}
    </Td>
    <Td className="font-semibold text-gray-800">PKR {b.totalAmount?.toLocaleString()}</Td>
    <Td><Badge label={b.paymentStatus} variant={b.paymentStatus} /></Td>
    <Td><Badge label={b.status} variant={b.status} /></Td>
  </Tr>
));

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(null);
  const [detail, setDetail] = useState(null);

  const params = { page, limit: 20, status: status ?? undefined };
  const { data, isLoading } = useAdminBookings(params);
  const { mutateAsync: updateStatus } = useAdminUpdateBookingStatus();

  const bookings = data?.bookings ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" /> Bookings
        </h2>
        <div className="text-sm text-gray-500 font-medium">{total.toLocaleString()} total</div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button
            key={String(s)}
            onClick={() => { setStatus(s); setPage(1); }}
            className={clsx(
              'px-3 py-1.5 text-xs font-semibold rounded-full border transition-all',
              status === s
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            )}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <Thead>
            <Th>Ref</Th><Th>Customer</Th><Th>Salon</Th>
            <Th>Date & Time</Th><Th>Services</Th><Th>Amount</Th>
            <Th>Payment</Th><Th>Status</Th>
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
              : bookings.map(b => (
                <BookingRow key={b.id} b={b} onSelect={setDetail} />
              ))
            }
          </Tbody>
        </Table>
        <Pagination page={page} total={total} limit={20} onChange={setPage} />
      </div>

      {/* Booking Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Booking #${detail?.id?.slice(0, 8).toUpperCase()}`} size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Customer</p>
                <p className="text-sm font-semibold">{detail.customer?.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />{detail.customer?.phone}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Salon</p>
                <p className="text-sm font-semibold">{detail.salon?.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">📍 {detail.salon?.city}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Scheduled</p>
                <p className="text-sm font-semibold">{format(new Date(detail.scheduledAt), 'dd MMM yyyy, h:mm a')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Payment</p>
                <p className="text-sm font-semibold">{detail.paymentMethod?.replace(/_/g, ' ')}</p>
                <Badge label={detail.paymentStatus} variant={detail.paymentStatus} />
              </div>
            </div>

            {/* Financials */}
            <div className="border border-gray-100 rounded-lg divide-y divide-gray-50">
              <div className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">PKR {detail.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-500">Platform fee (commission)</span>
                <span className="font-medium text-green-600">PKR {detail.platformFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-500">Salon receives</span>
                <span className="font-medium">PKR {(detail.subtotal - detail.platformFee)?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 font-semibold text-sm bg-gray-50">
                <span>Total charged</span>
                <span className="text-purple-600">PKR {detail.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge label={detail.status} variant={detail.status} />
              {detail.notes && <p className="text-xs text-gray-400 italic">"{detail.notes}"</p>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
