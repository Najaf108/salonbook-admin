// app/(dashboard)/salons/[id]/page.js
'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';
import { useAdminSalons, useSalonDetail, useVerifySalon, useSuspendSalon, useUpdateSalonPlan } from '@/hooks/useSalons';
import { useAdminBookings } from '@/hooks/useBookings';
import { useAllReviews, useHideReview, useRestoreReview } from '@/hooks/useReviews';
import Badge from '@/components/Badge';
import Confirm from '@/components/Confirm';
import Modal from '@/components/Modal';
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/DataTable';
import { ArrowLeft, Phone, MapPin, CheckCircle, XCircle, Star } from 'lucide-react';
import clsx from 'clsx';

const PLAN_COMMISSION = { BASIC: 10, PRO: 8, PREMIUM: 7 };

export default function SalonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [confirm, setConfirm] = useState(null);
  const [planModal, setPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({ plan: '', commission: '' });
  const [tab, setTab] = useState('overview');

  const { data: salon, isLoading } = useSalonDetail(id);
  const { data: bkData } = useAdminBookings({ salonId: id, limit: 10 });
  const { mutateAsync: verify, isPending: verifying } = useVerifySalon();
  const { mutateAsync: suspend, isPending: suspending } = useSuspendSalon();
  const { mutateAsync: updatePlan, isPending: planSaving } = useUpdateSalonPlan();

  const [reviewFilter, setReviewFilter] = useState('PUBLISHED');
  const [reportedOnly, setReportedOnly] = useState(false);

  const { data: revData, refetch: refetchReviews } = useAllReviews({
    salonId: id,
    status: reviewFilter === 'REPORTED' ? 'PUBLISHED' : reviewFilter,
    hasReports: reviewFilter === 'REPORTED' ? 'true' : undefined
  });
  const { mutateAsync: hideReview } = useHideReview();
  const { mutateAsync: restoreReview } = useRestoreReview();

  const bookings = bkData?.bookings ?? [];
  const reviews = revData?.reviews ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse fade-in">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="h-64 bg-gray-100 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!salon) return <p className="text-gray-500">Salon not found</p>;

  const handleConfirm = async () => {
    if (confirm?.action === 'verify') await verify(id);
    if (confirm?.action === 'suspend') await suspend(id);
    setConfirm(null);
  };

  const handlePlanSave = async () => {
    await updatePlan({ id, plan: planForm.plan, commission: planForm.commission });
    setPlanModal(false);
  };

  const TABS = ['overview', 'services', 'staff', 'bookings', 'reviews'];

  return (
    <div className="space-y-5 fade-in">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Salons
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPlanForm({ plan: salon.plan, commission: String(salon.commission) }); setPlanModal(true); }}
            className="px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors"
          >
            Change Plan
          </button>
          {!salon.isVerified && salon.isActive && (
            <button
              onClick={() => setConfirm({ action: 'verify' })}
              className="px-3 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Verify Salon
            </button>
          )}
          {salon.isActive && (
            <button
              onClick={() => setConfirm({ action: 'suspend' })}
              className="px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Suspend
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Photo strip */}
        <div className="flex gap-0.5 h-44 bg-gray-100 overflow-hidden">
          {salon.photos?.length
            ? salon.photos.slice(0, 4).map((photo, i) => (
              <div key={i} className={clsx('relative overflow-hidden', i === 0 ? 'flex-[2]' : 'flex-1')}>
                <Image src={photo} alt="Salon" fill className="object-cover" />
              </div>
            ))
            : <div className="w-full flex items-center justify-center text-5xl text-gray-300">💈</div>
          }
        </div>

        {/* Info bar */}
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{salon.name}</h2>
                <Badge
                  label={salon.isVerified ? 'Verified' : salon.isActive ? 'Pending' : 'Suspended'}
                  variant={salon.isVerified ? 'VERIFIED' : salon.isActive ? 'PENDING_VER' : 'SUSPENDED'}
                />
                <Badge label={salon.plan} variant={salon.plan} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{salon.address}, {salon.city}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{salon.phone}</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {salon.avgRating?.toFixed(1) || '—'} ({salon.totalReviews} reviews)
                </span>
              </div>
              {salon.description && <p className="mt-2 text-sm text-gray-600 max-w-xl">{salon.description}</p>}
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">{salon._count?.bookings ?? 0}</p>
                <p className="text-xs text-gray-400">Bookings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{salon.commission}%</p>
                <p className="text-xs text-gray-400">Commission</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-700">{salon._count?.reviews ?? 0}</p>
                <p className="text-xs text-gray-400">Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap capitalize transition-colors',
              tab === t ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Overview */}
        {tab === 'overview' && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard label="Gender" value={salon.gender} />
              <InfoCard label="Plan" value={salon.plan} />
              <InfoCard label="Commission" value={`${salon.commission}%`} />
              <InfoCard label="Joined" value={format(new Date(salon.createdAt), 'dd MMM yyyy')} />
            </div>
            {/* Working Hours */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Working Hours</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                  const h = salon.workingHours?.find(w => w.dayOfWeek === i);
                  return (
                    <div key={i} className={clsx('rounded-lg p-3 text-sm', h?.isClosed || !h ? 'bg-gray-50 text-gray-400' : 'bg-green-50 text-green-800')}>
                      <p className="font-semibold">{day}</p>
                      <p className="text-xs mt-0.5">
                        {!h || h.isClosed ? 'Closed' : `${h.openTime} – ${h.closeTime}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Services */}
        {tab === 'services' && (
          <Table>
            <Thead>
              <Th>Service</Th><Th>Category</Th><Th>Price</Th><Th>Duration</Th><Th>Status</Th>
            </Thead>
            <Tbody>
              {salon.services?.map(s => (
                <Tr key={s.id}>
                  <Td><span className="font-medium text-gray-800">{s.name}</span></Td>
                  <Td><Badge label={s.category} variant="default" /></Td>
                  <Td className="font-semibold text-purple-600">PKR {s.price.toLocaleString()}</Td>
                  <Td>{s.duration} min</Td>
                  <Td><Badge label={s.isActive ? 'Active' : 'Inactive'} variant={s.isActive ? 'CONFIRMED' : 'CANCELLED'} /></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {/* Staff */}
        {tab === 'staff' && (
          <Table>
            <Thead><Th>Name</Th><Th>Specialty</Th><Th>Status</Th></Thead>
            <Tbody>
              {salon.staff?.map(s => (
                <Tr key={s.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      {s.photo
                        ? <Image src={s.photo} alt={s.name} width={28} height={28} className="rounded-full" />
                        : <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">{s.name.charAt(0)}</div>
                      }
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </Td>
                  <Td className="text-gray-500">{s.specialty || '—'}</Td>
                  <Td><Badge label={s.isActive ? 'Active' : 'Inactive'} variant={s.isActive ? 'CONFIRMED' : 'CANCELLED'} /></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
          <Table>
            <Thead><Th>Customer</Th><Th>Date</Th><Th>Services</Th><Th>Amount</Th><Th>Status</Th></Thead>
            <Tbody>
              {bookings.map(b => (
                <Tr key={b.id}>
                  <Td>{b.customer?.name}</Td>
                  <Td className="text-gray-500">{format(new Date(b.scheduledAt), 'dd MMM yy, h:mm a')}</Td>
                  <Td className="max-w-xs truncate text-gray-500">{b.items?.map(i => i.service?.name).join(', ')}</Td>
                  <Td className="font-semibold">PKR {b.totalAmount?.toLocaleString()}</Td>
                  <Td><Badge label={b.status} variant={b.status} /></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {/* Reviews */}
        {tab === 'reviews' && (
          <div className="space-y-4 p-4">
            {/* Review Filter */}
            <div className="flex gap-2 mb-4">
              {[
                { label: 'All Active', value: 'PUBLISHED' },
                { label: 'Reported', value: 'REPORTED' },
                { label: 'Hidden', value: 'HIDDEN' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setReviewFilter(f.value)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
                    reviewFilter === f.value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
              {reviews.length
                ? reviews.map(r => (
                  <div key={r.id} className={clsx('p-5 hover:bg-gray-50 transition-colors', r.status === 'HIDDEN' && 'bg-gray-50 opacity-75')}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{r.customer?.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{r.id}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={clsx('w-3.5 h-3.5', i < r.overallRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />
                          ))}
                        </div>
                        {r.status === 'HIDDEN' && <Badge label="Hidden" variant="CANCELLED" />}
                        {r.status === 'REPORTED' && <Badge label="Reported" variant="PENDING" />}
                      </div>
                    </div>

                    {r.title && <p className="text-sm font-bold text-gray-800 mb-1">{r.title}</p>}
                    {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}

                    {/* Photos */}
                    {r.photos?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {r.photos.map((p, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100">
                            <Image src={p} alt="Review" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reports Reason */}
                    {r.status === 'REPORTED' && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs font-bold text-red-800 uppercase tracking-tight mb-1">Moderation Notice</p>
                        <p className="text-xs text-red-700 italic">
                          "{r.reportReason || 'No reason provided'}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-gray-400">{format(new Date(r.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                      <div className="flex gap-2">
                        {r.status === 'PUBLISHED' ? (
                          <button
                            onClick={() => {
                              if (confirm('Hide this review? It will no longer be visible to customers.')) {
                                hideReview(r.id).then(() => refetchReviews());
                              }
                            }}
                            className="px-3 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 rounded-md hover:bg-red-100 uppercase tracking-tight transition-colors"
                          >
                            Hide Review
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (confirm('Restore this review? It will be visible to everyone again.')) {
                                restoreReview(r.id).then(() => refetchReviews());
                              }
                            }}
                            className="px-3 py-1.5 text-[10px] font-bold text-green-600 bg-green-50 rounded-md hover:bg-green-100 uppercase tracking-tight transition-colors"
                          >
                            Restore Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
                : <div className="p-12 text-center">
                  <p className="text-2xl mb-2">🍃</p>
                  <p className="text-sm text-gray-400">No reviews found with this filter.</p>
                </div>
              }
            </div>
          </div>
        )}
      </div>

      {/* Plan Modal */}
      <Modal open={planModal} onClose={() => setPlanModal(false)} title="Update Salon Plan" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Plan</label>
            <div className="grid grid-cols-3 gap-2">
              {['BASIC', 'PRO', 'PREMIUM'].map(p => (
                <button
                  key={p}
                  onClick={() => setPlanForm(prev => ({ ...prev, plan: p, commission: String(PLAN_COMMISSION[p]) }))}
                  className={clsx(
                    'py-2.5 text-sm font-semibold rounded-lg border transition-all',
                    planForm.plan === p
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Commission Rate (%)</label>
            <input
              type="number"
              min={0} max={30} step={0.5}
              value={planForm.commission}
              onChange={e => setPlanForm(prev => ({ ...prev, commission: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setPlanModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={handlePlanSave}
              disabled={planSaving}
              className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-60"
            >
              {planSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        title={confirm?.action === 'verify' ? 'Verify Salon' : 'Suspend Salon'}
        message={
          confirm?.action === 'verify'
            ? `Verify "${salon.name}"? It will appear to customers immediately.`
            : `Suspend "${salon.name}"? It will be removed from all search results.`
        }
        confirmLabel={confirm?.action === 'verify' ? 'Verify' : 'Suspend'}
        danger={confirm?.action === 'suspend'}
        loading={verifying || suspending}
      />
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}