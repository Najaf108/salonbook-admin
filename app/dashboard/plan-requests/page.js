// app/(dashboard)/plan-requests/page.js
'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { usePlanRequests, useHandlePlanRequest } from '@/hooks/useSalons';
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/DataTable';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';
import Confirm from '@/components/Confirm';
import Modal from '@/components/Modal';
import { Crown, CheckCircle, XCircle, RefreshCcw, Edit } from 'lucide-react';
import clsx from 'clsx';

export default function PlanRequestsPage() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
    const [confirm, setConfirm] = useState(null); // { id, action: 'APPROVED' | 'REJECTED', name }

    const { data, isLoading } = usePlanRequests({ page, limit: 20, status });
    const { mutateAsync: handleRequest, isPending: processing } = useHandlePlanRequest();

    const [planModal, setPlanModal] = useState(null); // request
    const [selectedPlan, setSelectedPlan] = useState('');

    const requests = data?.requests ?? [];
    const total = data?.total ?? 0;

    const STATUS_FILTERS = [
        { key: 'PENDING', label: 'Pending' },
        { key: 'APPROVED', label: 'Approved' },
        { key: 'REJECTED', label: 'Rejected' },
        { key: 'ALL', label: 'All' },
    ];

    const onConfirmAction = async () => {
        if (!confirm) return;
        await handleRequest({ id: confirm.id, status: confirm.action });
        setConfirm(null);
    };

    const onUpdatePlanManual = async () => {
        if (!planModal || !selectedPlan) return;
        await handleRequest({
            id: planModal.id,
            status: 'APPROVED',
            plan: selectedPlan
        });
        setPlanModal(null);
    };

    return (
        <div className="space-y-4 fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" /> Plan Change Requests
                </h2>
            </div>

            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => { setStatus(f.key); setPage(1); }}
                        className={clsx(
                            'px-4 py-1.5 text-xs font-semibold rounded-lg transition-all',
                            status === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <Table>
                    <Thead>
                        <Th>Salon</Th>
                        <Th>Current Plan</Th>
                        <Th>Requested Plan</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                    </Thead>
                    <Tbody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <Tr key={i}>
                                    {[...Array(6)].map((_, j) => (
                                        <Td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></Td>
                                    ))}
                                </Tr>
                            ))
                        ) : requests.length === 0 ? (
                            <Tr>
                                <Td colSpan={6} className="text-center py-12 text-gray-400">
                                    No plan requests found
                                </Td>
                            </Tr>
                        ) : (
                            requests.map((req) => (
                                <Tr key={req.id}>
                                    <Td>
                                        <div>
                                            <p className="font-medium text-gray-900">{req.salon.name}</p>
                                            <p className="text-xs text-gray-400">{req.salon.city}</p>
                                        </div>
                                    </Td>
                                    <Td><Badge label={req.currentPlan} variant={req.currentPlan} /></Td>
                                    <Td><Badge label={req.requestedPlan} variant={req.requestedPlan} /></Td>
                                    <Td className="text-gray-400">{format(new Date(req.createdAt), 'dd MMM yy, hh:mm a')}</Td>
                                    <Td>
                                        <Badge
                                            label={req.status}
                                            variant={req.status === 'PENDING' ? 'PENDING_VER' : req.status === 'APPROVED' ? 'VERIFIED' : 'SUSPENDED'}
                                        />
                                    </Td>
                                    <Td>
                                        <div className="flex items-center gap-2">
                                            {req.status === 'PENDING' ? (
                                                <>
                                                    <button
                                                        onClick={() => setConfirm({ id: req.id, action: 'APPROVED', name: req.salon.name })}
                                                        className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirm({ id: req.id, action: 'REJECTED', name: req.salon.name })}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setConfirm({
                                                            id: req.id,
                                                            action: req.status === 'APPROVED' ? 'REJECTED' : 'APPROVED',
                                                            name: req.salon.name
                                                        })}
                                                        className="flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-all shadow-sm border border-purple-100 uppercase tracking-tighter"
                                                        title="Toggle Status"
                                                    >
                                                        <RefreshCcw className="w-3 h-3" />
                                                        Status
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setPlanModal(req);
                                                            setSelectedPlan(req.salon.plan || req.requestedPlan);
                                                        }}
                                                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-all shadow-sm border border-blue-100 uppercase tracking-tighter"
                                                        title="Modify Plan Directly"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                        Plan
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
                <Pagination page={page} total={total} limit={20} onChange={setPage} />
            </div>

            <Confirm
                open={!!confirm}
                onClose={() => setConfirm(null)}
                onConfirm={onConfirmAction}
                title={confirm?.action === 'APPROVED' ? 'Approve Plan Change' : 'Reject Plan Change'}
                message={`Are you sure you want to ${confirm?.action?.toLowerCase()} the plan change request for "${confirm?.name}"?`}
                confirmLabel={confirm?.action === 'APPROVED' ? 'Approve' : 'Reject'}
                danger={confirm?.action === 'REJECTED'}
                loading={processing}
            />

            <Modal
                open={!!planModal}
                onClose={() => setPlanModal(null)}
                title="Modify Salon Plan"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Manually update the plan for <strong>{planModal?.salon?.name}</strong>.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                        {['BASIC', 'PRO', 'PREMIUM'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setSelectedPlan(p)}
                                className={clsx(
                                    'flex items-center justify-between p-3 rounded-xl border transition-all text-left',
                                    selectedPlan === p ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                                )}
                            >
                                <span className="font-semibold">{p}</span>
                                {selectedPlan === p && <CheckCircle className="w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setPlanModal(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onUpdatePlanManual}
                            disabled={processing || selectedPlan === planModal?.salon?.plan}
                            className="px-6 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 shadow-sm"
                        >
                            {processing ? 'Updating...' : 'Update Plan'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
