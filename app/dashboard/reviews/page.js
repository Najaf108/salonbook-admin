'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';
import { useAllReviews, useHideReview, useRestoreReview } from '@/hooks/useReviews';
import Badge from '@/components/Badge';
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { Star, Eye, EyeOff, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function ReviewsManagementPage() {
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get('filter') === 'reported' ? 'REPORTED' : 'ALL';

    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState(initialFilter);

    const { data, isLoading, refetch } = useAllReviews({
        page,
        status: filter === 'HIDDEN' ? 'HIDDEN' : (filter === 'PUBLISHED' ? 'PUBLISHED' : undefined),
        hasReports: filter === 'REPORTED' ? 'true' : undefined
    });

    const { mutateAsync: hideReview } = useHideReview();
    const { mutateAsync: restoreReview } = useRestoreReview();

    const reviews = data?.reviews ?? [];
    const total = data?.total ?? 0;

    const handleHide = async (id) => {
        try {
            await hideReview(id);
            toast.success('Review hidden from public view');
            refetch();
        } catch (e) {
            toast.error('Failed to hide review');
        }
    };

    const handleRestore = async (id) => {
        try {
            await restoreReview(id);
            toast.success('Review restored to public view');
            refetch();
        } catch (e) {
            toast.error('Failed to restore review');
        }
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Review Moderation</h2>
                    <p className="text-sm text-gray-400">Manage platform feedback and reports</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {[
                    { label: 'All Reviews', value: 'ALL' },
                    { label: 'Reported', value: 'REPORTED' },
                    { label: 'Hidden', value: 'HIDDEN' },
                    { label: 'Published', value: 'PUBLISHED' },
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => { setFilter(f.value); setPage(1); }}
                        className={clsx(
                            'px-4 py-2 text-sm font-medium rounded-lg border transition-all',
                            filter === f.value
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <Table>
                    <Thead>
                        <Th>Reviewer / Salon</Th>
                        <Th>Content</Th>
                        <Th>Rating</Th>
                        <Th>Reports</Th>
                        <Th>Status</Th>
                        <Th className="text-right">Actions</Th>
                    </Thead>
                    <Tbody>
                        {isLoading ? (
                            <Tr><Td colSpan={6} className="text-center py-12 text-gray-400">Loading reviews...</Td></Tr>
                        ) : reviews.length === 0 ? (
                            <Tr><Td colSpan={6} className="text-center py-12 text-gray-400">No reviews found.</Td></Tr>
                        ) : reviews.map(review => (
                            <Tr key={review.id} className={clsx(review.status === 'HIDDEN' && 'bg-gray-50/50')}>
                                <Td>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">{review.customer?.name}</span>
                                        <span className="text-xs text-gray-400">at {review.salon?.name}</span>
                                    </div>
                                </Td>
                                <Td className="max-w-md">
                                    <div className="flex flex-col gap-1">
                                        {review.title && <p className="text-sm font-bold text-gray-800">{review.title}</p>}
                                        <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                                        <p className="text-[10px] text-gray-400">{format(new Date(review.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                                    </div>
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-bold">{review.overallRating}</span>
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    </div>
                                </Td>
                                <Td>
                                    {review.status === 'REPORTED' ? (
                                        <div className="flex flex-col gap-1">
                                            <Badge label="Reported" variant="PENDING" />
                                            <p className="text-[10px] text-red-600 italic line-clamp-1">
                                                "{review.reportReason || 'No reason provided'}"
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-300">—</span>
                                    )}
                                </Td>
                                <Td>
                                    <Badge
                                        label={review.status}
                                        variant={review.status === 'PUBLISHED' ? 'VERIFIED' : 'CANCELLED'}
                                    />
                                </Td>
                                <Td className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {review.status === 'PUBLISHED' ? (
                                            <button
                                                onClick={() => handleHide(review.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hide Review"
                                            >
                                                <EyeOff className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRestore(review.id)}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Restore Review"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

                {total > 20 && (
                    <div className="px-6 py-4 border-t border-gray-50">
                        <Pagination
                            current={page}
                            total={total}
                            limit={20}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
