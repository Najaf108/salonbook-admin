// src/hooks/useCommissions.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useCommissionReport(params) {
  return useQuery({
    queryKey: ['commissions', params],
    queryFn: async () => {
      const res = await api.get('/admin/commissions', { params });
      return res.data;
    },
  });
}

export function useSettleCommissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ salonId, startDate, endDate }) =>
      api.post('/admin/commissions/settle', { salonId, startDate, endDate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['commissions'] });
      qc.invalidateQueries({ queryKey: ['commissions-breakdown'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Commissions marked as settled');
    },
    onError: () => toast.error('Settlement failed'),
  });
}

export function useCommissionBreakdown() {
  return useQuery({
    queryKey: ['commissions-breakdown'],
    queryFn: async () => {
      const res = await api.get('/admin/commissions/breakdown');
      return res.data;
    },
  });
}
