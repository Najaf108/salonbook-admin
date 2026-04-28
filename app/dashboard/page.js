// app/(dashboard)/page.js
'use client';
import { useState } from 'react';
import { useDashboardStats, useRevenueChart, useBookingsChart } from '@/hooks/useDashboard';
import { useAdminSalons } from '@/hooks/useSalons';
import { useReviewMetrics } from '@/hooks/useReviews';
import StatCard from '@/components/StatCard';
import RevenueChart from '@/components/charts/RevenueChart';
import BookingsChart from '@/components/charts/BookingsChart';
import TopSalonsChart from '@/components/charts/TopSalonsChart';
import Badge from '@/components/Badge';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [period, setPeriod] = useState('month');
  const router = useRouter();

  const { data: stats, isLoading: statsLoading, refetch } = useDashboardStats();
  const { data: revChart, isLoading: revLoading } = useRevenueChart(period);
  const { data: bkChart, isLoading: bkLoading } = useBookingsChart();
  const { data: salons } = useAdminSalons({ verified: false, limit: 5 });
  const { data: reviewMetrics } = useReviewMetrics();

  const pendingSalons = salons?.salons ?? [];

  return (
    <div className="space-y-6 fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Platform Overview</h2>
          <p className="text-sm text-gray-400 mt-0.5">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="👥" label="Total Customers" value={(stats?.totalUsers ?? 0).toLocaleString()} sub="Registered users" color="purple" trend={stats?.userGrowth} trendUp={stats?.userGrowth > 0} />
            <StatCard icon="💈" label="Active Salons" value={(stats?.totalSalons ?? 0).toLocaleString()} sub={`${stats?.pendingVerifications ?? 0} pending`} color="blue" />
            <StatCard icon="📅" label="Today's Bookings" value={(stats?.totalBookingsToday ?? 0).toLocaleString()} color="green" />
            <StatCard
              icon="🚩"
              label="Reported Reviews"
              value={(reviewMetrics?.reportedCount ?? 0).toLocaleString()}
              sub="Awaiting review"
              color="amber"
              onClick={() => router.push('/dashboard/reviews?filter=reported')}
            />
            <StatCard
              icon="👑"
              label="Plan Requests"
              value={(stats?.pendingPlanRequests ?? 0).toLocaleString()}
              sub="Pending approval"
              color="purple"
              onClick={() => router.push('/dashboard/plan-requests')}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="💰" label="Month Revenue" value={`PKR ${((stats?.revenue?.totalRevenue ?? 0) / 1000).toFixed(1)}k`} color="green" trend={stats?.revenueGrowth} trendUp />
            <StatCard icon="🏦" label="Platform Fees" value={`PKR ${((stats?.revenue?.platformFees ?? 0) / 1000).toFixed(1)}k`} sub="Earned this month" color="purple" />
            <StatCard
              icon="💸"
              label="Owed by Salons"
              value={`PKR ${(stats?.outstandingCommission ?? 0).toLocaleString()}`}
              sub="Cash collection dues"
              color="amber"
              onClick={() => router.push('/dashboard/commissions')}
            />
            <StatCard icon="📊" label="Total Bookings" value={(stats?.revenue?.totalBookings ?? 0).toLocaleString()} sub="Completed" color="blue" />
            <StatCard icon="⭐" label="Platform Rating" value={(reviewMetrics?.avgRating ?? 0).toFixed(1)} sub="Total Average" color="amber" />
            <StatCard icon="📝" label="New Reviews" value={(reviewMetrics?.thisMonthCount ?? 0).toLocaleString()} sub="This Month" color="blue" />
          </div>
        </>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart — takes 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Revenue Overview</h3>
            <div className="flex gap-1">
              {['week', 'month', 'year'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${period === p ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56">
            {revLoading
              ? <div className="h-full bg-gray-50 rounded-lg animate-pulse" />
              : <RevenueChart data={revChart?.data ?? []} />
            }
          </div>
        </div>

        {/* Top Salons Doughnut */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Salons by Revenue</h3>
          <div className="h-56">
            {statsLoading
              ? <div className="h-full bg-gray-50 rounded-lg animate-pulse" />
              : <TopSalonsChart data={stats?.revenue?.topSalons ?? []} />
            }
          </div>
        </div>
      </div>

      {/* Bookings Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Bookings by Status (Last 30 Days)</h3>
        <div className="h-48">
          {bkLoading
            ? <div className="h-full bg-gray-50 rounded-lg animate-pulse" />
            : <BookingsChart data={bkChart?.data ?? []} />
          }
        </div>
      </div>

      {/* Pending Verifications */}
      {pendingSalons.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-amber-50 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <span className="text-base">⏳</span>
              <h3 className="text-sm font-semibold text-amber-900">Salons Pending Verification ({pendingSalons.length})</h3>
            </div>
            <button
              onClick={() => router.push('/dashboard/salons?verified=false')}
              className="text-xs text-amber-700 font-medium hover:text-amber-900"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingSalons.slice(0, 5).map(salon => (
              <div
                key={salon.id}
                onClick={() => router.push(`/dashboard/salons/${salon.id}`)}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{salon.name}</p>
                  <p className="text-xs text-gray-400">📍 {salon.city} · {salon.gender}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{format(new Date(salon.createdAt), 'dd MMM yyyy')}</span>
                  <Badge label="Pending" variant="PENDING" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
