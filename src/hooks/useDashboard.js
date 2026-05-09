// src/hooks/useDashboard.js
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const fetchStats = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data;
};

const fetchRevenueChart = async (period = 'month') => {
  const res = await api.get('/admin/revenue-chart', { params: { period } });
  return res.data;
};

const fetchBookingsChart = async () => {
  const res = await api.get('/admin/bookings-chart');
  return res.data;
};

export function useDashboardStats() {
  return useQuery({ queryKey: ['admin-dashboard'], queryFn: fetchStats, refetchInterval: 2 * 60_000 });
}

export function useRevenueChart(period) {
  return useQuery({ queryKey: ['revenue-chart', period], queryFn: () => fetchRevenueChart(period) });
}

export function useBookingsChart() {
  return useQuery({ queryKey: ['bookings-chart'], queryFn: fetchBookingsChart });
}
