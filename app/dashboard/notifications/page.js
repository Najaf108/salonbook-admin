// app/dashboard/notifications/page.js
'use client';
import { useState } from 'react';
import { Bell, Send, Clock, Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNotificationHistory, useSendNotification } from '@/hooks/useNotifications';
import Pagination from '@/components/Pagination';

export default function NotificationsPage() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [page, setPage] = useState(1);
    const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message, stats }

    const { data, isLoading: historyLoading } = useNotificationHistory(page);
    const { mutateAsync: send, isPending: isSending } = useSendNotification();

    const notifications = data?.notifications ?? [];
    const total = data?.total ?? 0;

    const handleSend = async () => {
        if (!title.trim() || !body.trim()) {
            setFeedback({ type: 'error', message: 'Title aur message dono likhna zaruri hai.' });
            return;
        }
        try {
            const result = await send({ title: title.trim(), body: body.trim() });
            setFeedback({
                type: 'success',
                message: `Notification successfully bheji gayi!`,
                stats: result,
            });
            setTitle('');
            setBody('');
        } catch (err) {
            setFeedback({ type: 'error', message: err?.response?.data?.error || 'Kuch ghalat ho gaya, dobara try karein.' });
        }
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                    Broadcast Notifications
                </h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Sab customers ko bhejta hai
                </span>
            </div>

            {/* Compose Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Send className="w-4 h-4 text-purple-500" />
                    Notification Compose Karein
                </h3>

                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => { setTitle(e.target.value); setFeedback(null); }}
                            placeholder="e.g. 🎉 Eid Special Offer!"
                            maxLength={80}
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder-gray-300"
                        />
                        <p className="text-right text-xs text-gray-300 mt-1">{title.length}/80</p>
                    </div>

                    {/* Body */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                            Message *
                        </label>
                        <textarea
                            value={body}
                            onChange={e => { setBody(e.target.value); setFeedback(null); }}
                            placeholder="Apna notification message yahan likhein..."
                            maxLength={200}
                            rows={3}
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all resize-none placeholder-gray-300"
                        />
                        <p className="text-right text-xs text-gray-300 mt-1">{body.length}/200</p>
                    </div>

                    {/* Preview */}
                    {(title || body) && (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-2 font-medium">📱 Preview</p>
                            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                <p className="text-sm font-semibold text-gray-800">{title || '(Title)'}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{body || '(Message)'}</p>
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {feedback && (
                        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm ${feedback.type === 'success'
                                ? 'bg-green-50 border border-green-100 text-green-700'
                                : 'bg-red-50 border border-red-100 text-red-600'
                            }`}>
                            {feedback.type === 'success'
                                ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            }
                            <div>
                                <p className="font-medium">{feedback.message}</p>
                                {feedback.stats && (
                                    <p className="text-xs mt-0.5 opacity-80">
                                        {feedback.stats.sent} users ko mili · {feedback.stats.failed} failed · {feedback.stats.total} total
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={isSending || !title.trim() || !body.trim()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Bhej raha hai...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Sab Customers ko Bhejein
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        Sent History
                    </h3>
                    <span className="text-xs text-gray-400">{total} total</span>
                </div>

                {historyLoading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-16 text-center">
                        <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">Abhi tak koi notification nahi bheji gayi</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map(n => (
                            <div key={n.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{n.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                                    <p className="text-xs text-gray-300 mt-1">
                                        By {n.admin?.name ?? 'Admin'}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <Users className="w-3 h-3" />
                                        {n.sentTo}
                                    </span>
                                    <p className="text-xs text-gray-300 mt-1.5">
                                        {format(new Date(n.sentAt), 'dd MMM, hh:mm a')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination page={page} total={total} limit={20} onChange={setPage} />
            </div>
        </div>
    );
}
