'use client';
import { useState, useRef, useEffect } from 'react';
import { useSupportTickets, useSupportTicket, useReplyToTicket, useUpdateTicketStatus } from '@/hooks/useSupport';
import { format } from 'date-fns';
import { Send, CheckCircle, Search, User } from 'lucide-react';
import Badge from '@/components/Badge';

export default function SupportPage() {
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [replyText, setReplyText] = useState('');

    const { data: ticketsData, isLoading: loadingTickets } = useSupportTickets({ status: statusFilter });
    const { data: activeTicket, isLoading: loadingActive } = useSupportTicket(selectedTicketId);

    const { mutate: sendReply, isPending: isReplying } = useReplyToTicket();
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateTicketStatus();

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (activeTicket) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeTicket?.messages]);

    const handleSend = () => {
        if (!replyText.trim() || !selectedTicketId) return;
        sendReply({ ticketId: selectedTicketId, content: replyText.trim() }, {
            onSuccess: () => setReplyText('')
        });
    };

    const handleResolve = () => {
        if (!selectedTicketId) return;
        updateStatus({ ticketId: selectedTicketId, status: 'RESOLVED' });
    };

    return (
        <div className="h-[calc(100vh-100px)] flex border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm">
            {/* Left Panel: Ticket List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/50">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-bold text-gray-900">Support Tickets</h2>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setStatusFilter('')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === '' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter('OPEN')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === 'OPEN' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Open
                        </button>
                        <button
                            onClick={() => setStatusFilter('RESOLVED')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === 'RESOLVED' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Resolved
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingTickets ? (
                        <div className="p-4 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : ticketsData?.tickets?.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                            <CheckCircle className="w-12 h-12 mb-3 text-gray-300" />
                            <p>No support tickets found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {ticketsData?.tickets?.map(ticket => {
                                const isSelected = selectedTicketId === ticket.id;
                                return (
                                    <button
                                        key={ticket.id}
                                        onClick={() => setSelectedTicketId(ticket.id)}
                                        className={`w-full text-left p-4 hover:bg-white transition-colors ${isSelected ? 'bg-white border-l-4 border-purple-600' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-gray-900 truncate pr-2 flex-1">
                                                {ticket.user.name || ticket.user.phone || 'Customer'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                {format(new Date(ticket.updatedAt), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-500 truncate pr-4 flex-1">
                                                {ticket.lastMessage?.content || 'No messages yet'}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                {ticket.unreadCount > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {ticket.unreadCount} NEW
                                                    </span>
                                                )}
                                                <div className={`w-2 h-2 rounded-full ${ticket.status === 'OPEN' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Chat Thread */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {!selectedTicketId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
                        <MessageSquarePlaceholder />
                        <p className="mt-4">Select a ticket to view the conversation</p>
                    </div>
                ) : loadingActive ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                            <div className="flex items-center gap-3">
                                {activeTicket?.user.profilePhoto ? (
                                    <img src={activeTicket.user.profilePhoto} alt="User" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900">{activeTicket?.user.name || 'Unknown User'}</h3>
                                    <p className="text-xs text-gray-500">
                                        {activeTicket?.user.phone}{activeTicket?.user.email ? ` • ${activeTicket.user.email}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge
                                    label={activeTicket?.status}
                                    variant={activeTicket?.status === 'OPEN' ? 'PENDING' : 'ACTIVE'}
                                />
                                {activeTicket?.status === 'OPEN' && (
                                    <button
                                        onClick={handleResolve}
                                        disabled={isUpdating}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Mark Resolved
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-4">
                            {activeTicket?.messages?.map(msg => {
                                const isAdmin = msg.isAdmin;
                                return (
                                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${isAdmin ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm'}`}>
                                            <p className="text-sm pb-1 break-words">{msg.content}</p>
                                            <p className={`text-[10px] text-right mt-1 ${isAdmin ? 'text-purple-200' : 'text-gray-400'}`}>
                                                {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="bg-white border-t border-gray-200 p-4">
                            {activeTicket?.status === 'RESOLVED' ? (
                                <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500 font-medium">
                                    Ticket resolved. The customer can reply to automatically reopen it.
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Type your reply to the customer..."
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!replyText.trim() || isReplying}
                                        className="bg-purple-600 text-white px-5 py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                    >
                                        {isReplying ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function MessageSquarePlaceholder() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="M8 9h8"></path>
            <path d="M8 13h6"></path>
        </svg>
    );
}
