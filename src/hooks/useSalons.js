// src/hooks/useSalons.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const fetchSalons = async (params) => {
  const res = await api.get('/admin/salons', { params });
  return res.data;
};

const fetchSalon = async (id) => {
  const res = await api.get(`/salons/${id}`);
  return res.data;
};

export function useAdminSalons(params) {
  return useQuery({ queryKey: ['admin-salons', params], queryFn: () => fetchSalons(params) });
}

export function useSalonDetail(id) {
  return useQuery({ queryKey: ['salon', id], queryFn: () => fetchSalon(id), enabled: !!id });
}

export function useVerifySalon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/admin/salons/${id}/verify`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-salons'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Salon verified successfully');
    },
    onError: () => toast.error('Could not verify salon'),
  });
}

export function useSuspendSalon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/admin/salons/${id}/suspend`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-salons'] });
      toast.success('Salon suspended');
    },
    onError: () => toast.error('Could not suspend salon'),
  });
}

export function useUnsuspendSalon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/admin/salons/${id}/unsuspend`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-salons'] });
      toast.success('Salon activated');
    },
    onError: () => toast.error('Could not unsuspend salon'),
  });
}

export function useUpdateSalonPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plan, commission }) => api.patch(`/admin/salons/${id}/plan`, { plan, commission }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-salons'] });
      toast.success('Plan updated');
    },
  });
}

export function usePlanRequests(params) {
  return useQuery({
    queryKey: ['plan-requests', params],
    queryFn: async () => {
      const res = await api.get('/admin/plan-requests', { params });
      return res.data;
    }
  });
}

export function useHandlePlanRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, plan }) => api.patch(`/admin/plan-requests/${id}`, { status, plan }),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['plan-requests'] });
      qc.invalidateQueries({ queryKey: ['admin-salons'] });
      toast.success(`Request ${variables.status.toLowerCase()}ed`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Error processing request'),
  });
}

