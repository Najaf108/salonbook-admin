// src/hooks/useUsers.js
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const fetchUsers = async (params) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
};

export function useAdminUsers(params) {
    return useQuery({
        queryKey: ['admin-users', params],
        queryFn: () => fetchUsers(params),
        staleTime: 60_000,
    });
}
