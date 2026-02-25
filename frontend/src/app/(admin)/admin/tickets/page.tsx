'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, AlertCircle, MessageSquare } from 'lucide-react';

export default function AdminTicketsPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchTickets = async () => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const url = statusFilter === 'all'
                ? 'http://localhost:8001/admin/tickets'
                : `http://localhost:8001/admin/tickets?status=${statusFilter}`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${session.accessToken}` }
            });
            if (!res.ok) throw new Error('Failed to fetch tickets');
            const data = await res.json();
            setTickets(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchTickets();
    }, [session, statusFilter]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'open': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
            case 'in_progress': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'resolved': return 'bg-green-500/10 text-green-500 border border-green-500/20';
            default: return 'bg-neutral-800 text-neutral-400 border border-neutral-700';
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-500 font-bold';
            case 'high': return 'text-orange-500 font-bold';
            case 'normal': return 'text-blue-400';
            default: return 'text-neutral-500';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">Support Queue</h1>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">Filter Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 text-white text-sm rounded-lg py-2 px-3 focus:ring-[#4f9e97]"
                    >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                        <option value="all">All Statuses</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12 text-[#4f9e97]"><Loader2 className="animate-spin w-8 h-8" /></div>
            ) : error ? (
                <div className="p-8 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {tickets.length === 0 ? (
                        <div className="glass-card p-12 text-center text-neutral-500 border border-neutral-800 border-dashed rounded-2xl flex flex-col items-center">
                            <MessageSquare className="w-12 h-12 mb-4 text-neutral-700" />
                            <p>No tickets found for this filter.</p>
                        </div>
                    ) : (
                        tickets.map(ticket => (
                            <Link href={`/support/${ticket.id}`} key={ticket.id} className="block group">
                                <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group-hover:border-[#4f9e97]/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className={`text-xs uppercase tracking-wider ${getPriorityStyle(ticket.priority)}`}>
                                                {ticket.priority} Priority
                                            </span>
                                            <span className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                                                • {ticket.category.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-[#4f9e97] transition-colors mb-1">
                                            {ticket.subject}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                                            <span>Ticket ID: {ticket.id.substring(0, 8)}</span>
                                            <span>•</span>
                                            <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="text-sm font-medium text-[#4f9e97] bg-[#4f9e97]/10 px-4 py-2 rounded-lg group-hover:bg-[#4f9e97] group-hover:text-black transition-colors shrink-0 text-center">
                                        View Thread &rarr;
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
