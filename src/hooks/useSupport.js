import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useSupportTickets(params = {}) {
    return useQuery({
        queryKey: ['supportTickets', params],
        queryFn: async () => {
            const res = await api.get('/support/admin/tickets', { params });
            return res.data;
        },
        refetchInterval: 5000 // Poll every 5s for new messages/tickets
    });
}

export function useSupportTicket(ticketId) {
    return useQuery({
        queryKey: ['supportTicket', ticketId],
        queryFn: async () => {
            const res = await api.get(`/support/admin/tickets/${ticketId}`);
            return res.data;
        },
        enabled: !!ticketId,
        refetchInterval: 3000 // Poll faster when viewing a specific ticket
    });
}

export function useReplyToTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ticketId, content }) => {
            const res = await api.post(`/support/admin/tickets/${ticketId}/messages`, { content });
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['supportTicket', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
        }
    });
}

export function useUpdateTicketStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ticketId, status }) => {
            const res = await api.patch(`/support/admin/tickets/${ticketId}/status`, { status });
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['supportTicket', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
        }
    });
}
