import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useAllReviews(params = {}) {
    return useQuery({
        queryKey: ['reviews', 'admin', params],
        queryFn: async () => {
            const res = await api.get('/reviews/admin/all', { params })
            return res.data
        },
    })
}

export function useHideReview() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id) => {
            const res = await api.patch(`/reviews/${id}/hide`)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] })
        },
    })
}

export function useRestoreReview() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id) => {
            const res = await api.patch(`/reviews/${id}/restore`)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] })
        },
    })
}

export function useReviewMetrics() {
    return useQuery({
        queryKey: ['reviews', 'metrics'],
        queryFn: async () => {
            const res = await api.get('/reviews/admin/metrics')
            return res.data
        }
    })
}
