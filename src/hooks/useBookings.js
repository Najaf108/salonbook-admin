// src/hooks/useBookings.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useAdminBookings(params) {
  return useQuery({
    queryKey: ['admin-bookings', params],
    queryFn:  async () => {
      const res = await api.get('/admin/bookings', { params });
      return res.data;
    },
  });
}

export function useAdminUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => api.patch(`/bookings/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking status updated');
    },
  });
}
