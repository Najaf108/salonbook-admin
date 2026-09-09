// src/hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const fetchHistory = async ({ page = 1 } = {}) => {
    const res = await api.get('/admin/notifications/history', { params: { page, limit: 20 } });
    return res.data;
};

const sendNotification = async ({ title, body }) => {
    const res = await api.post('/admin/notifications/send', { title, body });
    return res.data;
};

export function useNotificationHistory(page = 1) {
    return useQuery({
        queryKey: ['admin-notification-history', page],
        queryFn: () => fetchHistory({ page }),
        staleTime: 30_000,
    });
}

export function useSendNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: sendNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notification-history'] });
        },
    });
}
