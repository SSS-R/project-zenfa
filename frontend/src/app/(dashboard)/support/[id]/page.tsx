'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShadowOverlay } from '@/components/ui/shadow-overlay';
import { Loader2, AlertCircle, Send, CheckCircle } from 'lucide-react';

export default function TicketThreadPage() {
    const { id } = useParams();
    const { data: session } = useSession();

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);

    useEffect(() => {
        const fetchTicket = async () => {
            if (!session?.accessToken || !id) return;

            try {
                const res = await fetch(`http://localhost:8001/support/tickets/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`
                    }
                });

                if (!res.ok) throw new Error('Failed to fetch ticket thread');

                const data = await res.json();
                setTicket(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchTicket();
    }, [session, id]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !session?.accessToken) return;

        setReplying(true);
        try {
            const res = await fetch(`http://localhost:8001/support/tickets/${id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({ message: replyText.trim() })
            });

            if (!res.ok) throw new Error('Failed to send reply');

            const newMessage = await res.json();

            // Append locally
            setTicket((prev: any) => ({
                ...prev,
                status: prev.status === 'resolved' || prev.status === 'closed' ? 'in_progress' : prev.status,
                messages: [...prev.messages, newMessage]
            }));

            setReplyText('');
        } catch (err: any) {
            alert(err.message); // simple alert for reply error
        } finally {
            setReplying(false);
        }
    };

    const isResolved = ticket?.status === 'resolved' || ticket?.status === 'closed';

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 relative">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ShadowOverlay />
            </div>

            <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row gap-6 items-start">

                {/* Main Thread Area */}
                <div className="flex-1 w-full order-2 md:order-1">
                    <div className="mb-6">
                        <Link href="/support" className="text-neutral-400 hover:text-white text-sm mb-2 inline-block">
                            &larr; Back to Tickets
                        </Link>
                        {ticket && (
                            <h1 className="text-2xl md:text-3xl font-bold">{ticket.subject}</h1>
                        )}
                    </div>

                    {loading ? (
                        <div className="glass-card p-12 text-center text-[#4f9e97] flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-red-400">
                            <AlertCircle className="w-6 h-6 mb-2" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Messages */}
                            <div className="space-y-4">
                                {ticket.messages.map((msg: any) => {
                                    const isAdmin = msg.sender_role === 'admin' || msg.sender_role === 'support';
                                    return (
                                        <div key={msg.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[85%] rounded-2xl p-5 ${isAdmin
                                                    ? 'bg-neutral-800 border border-neutral-700/50 rounded-tl-sm'
                                                    : 'bg-[#4f9e97]/10 border border-[#4f9e97]/30 rounded-tr-sm'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-2 text-xs">
                                                    <span className={`font-bold uppercase tracking-wider ${isAdmin ? 'text-white' : 'text-[#4f9e97]'}`}>
                                                        {isAdmin ? 'PC Lagbe Team' : 'You'}
                                                    </span>
                                                    <span className="text-neutral-500">
                                                        {new Date(msg.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-neutral-200 whitespace-pre-wrap leading-relaxed text-sm">
                                                    {msg.message}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reply Box */}
                            <div className="glass-card p-4 sticky bottom-4">
                                {isResolved && (
                                    <div className="mb-4 p-3 bg-neutral-800/50 rounded-lg flex items-center justify-center gap-2 text-sm text-neutral-400">
                                        <CheckCircle size={16} className="text-neutral-500" />
                                        This ticket is marked as {ticket.status}. Replying will reopen it.
                                    </div>
                                )}

                                <form onSubmit={handleReply} className="flex gap-2">
                                    <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#4f9e97] resize-none"
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleReply(e);
                                            }
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!replyText.trim() || replying}
                                        className="bg-[#4f9e97] hover:bg-[#6ce0d4] text-black w-12 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                                    >
                                        {replying ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Details */}
                {ticket && (
                    <div className="w-full md:w-64 shrink-0 order-1 md:order-2 space-y-4">
                        <div className="glass-card p-5">
                            <h3 className="font-bold text-sm text-neutral-400 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">Ticket Details</h3>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <div className="text-neutral-500 mb-1 text-xs uppercase tracking-wider font-semibold">Status</div>
                                    <div className="capitalize font-medium text-white">{ticket.status.replace('_', ' ')}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 mb-1 text-xs uppercase tracking-wider font-semibold">Priority</div>
                                    <div className="capitalize text-white">{ticket.priority}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 mb-1 text-xs uppercase tracking-wider font-semibold">Category</div>
                                    <div className="capitalize text-white">{ticket.category.replace('_', ' ')}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 mb-1 text-xs uppercase tracking-wider font-semibold">Created</div>
                                    <div className="text-white">{new Date(ticket.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
