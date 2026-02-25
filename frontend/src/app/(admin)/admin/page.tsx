'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Users, CreditCard, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            if (!session?.accessToken) return;
            try {
                const res = await fetch('http://localhost:8001/admin/analytics', {
                    headers: { 'Authorization': `Bearer ${session.accessToken}` }
                });
                if (!res.ok) throw new Error('Failed to fetch analytics');
                const data = await res.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchStats();
    }, [session]);

    if (loading) return <div className="p-12 flex justify-center text-[#4f9e97]"><Loader2 className="animate-spin w-8 h-8" /></div>;
    if (error) return <div className="p-8 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"><AlertCircle /> {error}</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Analytics Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Total Revenue */}
                <div className="glass-card-glow p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#4f9e97]/10 flex items-center justify-center text-[#4f9e97]">
                            <span className="text-xl font-bold">৳</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-white mb-1">
                            {stats?.total_revenue_bdt?.toLocaleString()}
                        </div>
                        <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Total Revenue</div>
                    </div>
                </div>

                {/* Total Users */}
                <div className="glass-card p-6 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Users size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-white mb-1">
                            {stats?.total_users?.toLocaleString()}
                        </div>
                        <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Registered Users</div>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="glass-card p-6 border-l-4 border-l-yellow-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                            <Clock size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-white mb-1">
                            {stats?.pending_manual_transactions?.toLocaleString()}
                        </div>
                        <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Pending Payments</div>
                    </div>
                </div>

                {/* Open Tickets */}
                <div className="glass-card p-6 border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-white mb-1">
                            {stats?.open_support_tickets?.toLocaleString()}
                        </div>
                        <div className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Open Tickets</div>
                    </div>
                </div>

            </div>

            {/* Quick Actions & Referrals Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Getting Started / Tasks */}
                <div className="glass-card p-8 bg-neutral-900/50">
                    <h2 className="text-xl font-bold mb-4">Admin Tasks</h2>
                    <div className="flex flex-col gap-3 text-neutral-400 text-sm">
                        <p>• Review the <strong>Transactions</strong> tab if you have pending manual payments that need bKash TrxID verification to grant tokens.</p>
                        <p>• Check <strong>Support Tickets</strong> to assist users who are stuck.</p>
                        <p>• In <strong>Users & Tokens</strong>, you can manually credit or deduct tokens for specific users, or promote other members to Admin status.</p>
                    </div>
                </div>

                {/* Top Referrers (Gamification) */}
                <div className="glass-card p-8 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.03)] bg-gradient-to-br from-yellow-500/5 to-transparent">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
                            <span className="bg-yellow-500/20 p-2 rounded-lg"><Users size={18} /></span>
                            Top Referrers
                        </h2>
                        <span className="text-xs text-neutral-500 font-mono">MVP BOARD</span>
                    </div>

                    <div className="space-y-4">
                        {(!stats?.top_referrers || stats.top_referrers.length === 0) ? (
                            <p className="text-sm text-neutral-500 text-center py-4">No referrers yet.</p>
                        ) : (
                            stats.top_referrers.map((user: any, idx: number) => (
                                <div key={user.id} className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 text-center font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-neutral-600'}`}>
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{user.display_name || 'Anonymous User'}</div>
                                            <div className="text-xs text-neutral-500 font-mono">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
                                            {user.total_referrals}
                                        </div>
                                        <div className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">Invites</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
