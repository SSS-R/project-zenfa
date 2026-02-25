'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShadowOverlay } from '@/components/ui/shadow-overlay';
import { Plus, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';

export default function SupportTicketsPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTickets = async () => {
            if (!session?.accessToken) return;

            try {
                const res = await fetch('http://localhost:8001/support/tickets', {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`
                    }
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

        if (session) {
            fetchTickets();
        } else if (session === null) {
            setLoading(false);
            setError('Please log in to view your support tickets.');
        }
    }, [session]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'in_progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'resolved': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'closed': return 'text-neutral-500 bg-neutral-800 border-neutral-700';
            default: return 'text-neutral-400 bg-neutral-800 border-neutral-700';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 relative">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ShadowOverlay />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm mb-2 inline-block">
                            &larr; Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold">Support Tickets</h1>
                    </div>
                    <Link href="/support/new" className="btn-primary px-6 py-2 text-sm rounded-xl flex items-center gap-2">
                        <Plus size={16} /> New Ticket
                    </Link>
                </div>

                {loading ? (
                    <div className="glass-card p-12 text-center text-[#4f9e97] flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        Loading tickets...
                    </div>
                ) : error ? (
                    <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-red-400 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-lg mb-1">Error Loading Tickets</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="glass-card p-16 text-center text-neutral-500 border border-neutral-800 border-dashed rounded-2xl flex flex-col items-center">
                        <MessageSquare className="w-16 h-16 mb-4 text-neutral-700" />
                        <h3 className="text-xl font-bold text-white mb-2">No tickets yet</h3>
                        <p className="mb-6 max-w-md">If you have any issues with payments, your account, or the PC Builder, our support team is here to help.</p>
                        <Link href="/support/new" className="text-[#4f9e97] hover:underline font-medium">
                            Create your first ticket
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map(ticket => (
                            <Link href={`/support/${ticket.id}`} key={ticket.id} className="block group">
                                <div className="glass-card p-5 group-hover:border-[#4f9e97]/50 transition-colors flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border font-bold ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                                                {ticket.category.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-[#4f9e97] transition-colors">
                                            {ticket.subject}
                                        </h3>
                                        <div className="text-xs text-neutral-500 mt-1">
                                            Created on {new Date(ticket.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-neutral-600 group-hover:text-[#4f9e97] transition-colors">
                                        &rarr;
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
