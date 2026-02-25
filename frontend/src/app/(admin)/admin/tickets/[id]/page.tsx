'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, Send, CheckCircle } from 'lucide-react';

export default function AdminTicketThreadPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchTicket = async () => {
        if (!session?.accessToken || !id) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8001/admin/tickets/${id}`, {
                headers: { 'Authorization': `Bearer ${session.accessToken}` }
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

    useEffect(() => {
        if (session) fetchTicket();
        else if (sessionStatus === 'unauthenticated') {
            router.push('/');
        }
    }, [session, id, sessionStatus, router]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !session?.accessToken) return;

        setReplying(true);
        try {
            const res = await fetch(`http://localhost:8001/admin/tickets/${id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({ message: replyText.trim() })
            });

            if (!res.ok) throw new Error('Failed to send reply');
            const newMessage = await res.json();

            setTicket((prev: any) => ({
                ...prev,
                status: prev.status === 'open' ? 'in_progress' : prev.status,
                messages: [...prev.messages, newMessage]
            }));

            setReplyText('');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setReplying(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!session?.accessToken) return;
        setUpdatingStatus(true);
        try {
            const res = await fetch(`http://localhost:8001/admin/tickets/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Failed to update status');
            const updated = await res.json();
            setTicket((prev: any) => ({ ...prev, status: updated.status }));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const isResolved = ticket?.status === 'resolved' || ticket?.status === 'closed';

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <Link href="/admin/tickets" className="text-neutral-400 hover:text-white text-sm mb-2 inline-block">
                    &larr; Back to Queue
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
                <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-red-400 flex items-center gap-3">
                    <AlertCircle className="w-6 h-6" />
                    <p>{error}</p>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-6 items-start">

                    {/* Main Thread Area */}
                    <div className="flex-1 w-full order-2 md:order-1 space-y-6">
                        <div className="space-y-4">
                            {ticket.messages.length === 0 && (
                                <div className="text-neutral-500 italic">No messages yet.</div>
                            )}
                            {ticket.messages.map((msg: any) => {
                                const isAdmin = msg.sender_role === 'admin' || msg.sender_role === 'support';
                                return (
                                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl p-5 ${isAdmin
                                            ? 'bg-[#4f9e97]/10 border border-[#4f9e97]/30 rounded-tr-sm'
                                            : 'bg-neutral-800 border border-neutral-700/50 rounded-tl-sm'
                                            }`}>
                                            <div className="flex items-center justify-between gap-4 mb-2 text-xs">
                                                <span className={`font-bold uppercase tracking-wider ${isAdmin ? 'text-[#4f9e97]' : 'text-white'}`}>
                                                    {isAdmin ? 'PC Lagbe Support (You)' : 'User'}
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
                        <div className="glass-card p-4">
                            {isResolved && (
                                <div className="mb-4 p-3 bg-neutral-800/50 rounded-lg flex items-center justify-center gap-2 text-sm text-neutral-400">
                                    <CheckCircle size={16} className="text-neutral-500" />
                                    This ticket is marked as {ticket.status}. You can still reply to reopen or add context.
                                </div>
                            )}

                            <form onSubmit={handleReply} className="flex gap-2">
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Type your reply to the user..."
                                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#4f9e97] resize-none"
                                    rows={3}
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
                                    className="bg-[#4f9e97] hover:bg-[#6ce0d4] text-black px-6 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shrink-0 font-bold"
                                >
                                    {replying ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} className="mr-2" /> Send Reply</>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Details / Actions */}
                    <div className="w-full md:w-64 shrink-0 order-1 md:order-2 space-y-4">
                        <div className="glass-card p-5">
                            <h3 className="font-bold text-sm text-neutral-400 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">Ticket Info</h3>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <div className="text-neutral-500 mb-1 text-xs uppercase tracking-wider font-semibold">Status</div>
                                    <select
                                        value={ticket.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        disabled={updatingStatus}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white text-sm"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <div className="text-neutral-500 mb-1 text-xs uppercase tracking-wider font-semibold">Priority</div>
                                    <div className="capitalize text-white py-1">{ticket.priority}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 mb-1 text-xs uppercase tracking-wider font-semibold">Category</div>
                                    <div className="capitalize text-white py-1">{ticket.category.replace('_', ' ')}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 mb-1 text-xs uppercase tracking-wider font-semibold">Created by</div>
                                    <div className="text-white py-1 overflow-hidden text-ellipsis text-xs">{ticket.user_id}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 mb-1 text-xs uppercase tracking-wider font-semibold">Created at</div>
                                    <div className="text-white py-1">{new Date(ticket.created_at).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
