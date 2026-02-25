"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShadowOverlay } from "@/components/ui/shadow-overlay";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { data: session } = useSession();
    const [ticketCount, setTicketCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (session?.user?.role === 'admin' || session?.user?.role === 'ADMIN') {
            router.push('/admin');
        }
    }, [session, router]);

    useEffect(() => {
        const fetchTickets = async () => {
            if (!session?.accessToken) return;
            try {
                const res = await fetch("http://localhost:8001/support/tickets", {
                    headers: { 'Authorization': `Bearer ${session.accessToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTicketCount(data.length);
                }
            } catch (e) {
                console.error("Failed to fetch tickets", e);
            }
        };
        fetchTickets();
    }, [session]);
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 relative">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ShadowOverlay />
            </div>
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">My Dashboard</h1>
                    <Link href="/build" className="btn-primary px-6 py-2 text-sm rounded-xl">New Build</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Token Balance Card */}
                    <div className="glass-card-glow p-6 md:col-span-2 flex flex-col justify-center">
                        <h2 className="text-neutral-400 text-sm uppercase tracking-wider font-semibold mb-2">Current Balance</h2>
                        <div className="flex items-end gap-3 mb-4">
                            <span className="text-5xl font-extrabold text-[#4f9e97]">
                                {/* Assuming NextAuth session has token_balance, else fallback to 10 for guest/UI */}
                                {(session?.user as any)?.token_balance || 10}
                            </span>
                            <span className="text-xl text-neutral-500 font-medium pb-1">Tokens</span>
                        </div>
                        <p className="text-sm text-neutral-400 mb-6">You have enough tokens for <strong className="text-white">
                            {Math.floor(((session?.user as any)?.token_balance || 10) / 10)} Full AI Builds
                        </strong>.</p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/pricing" className="text-[#4f9e97] hover:text-[#6ee1c9] font-medium border border-[#4f9e97]/30 bg-[#4f9e97]/10 rounded-lg px-4 py-2 transition text-sm">
                                Get More Tokens
                            </Link>
                            <Link href="/dashboard/leaderboard" className="text-yellow-500 hover:text-yellow-400 font-medium border border-yellow-500/30 bg-yellow-500/10 rounded-lg px-4 py-2 transition text-sm flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                View Leaderboard
                            </Link>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-l-[#4f9e97]">
                        <h3 className="text-neutral-400 font-medium mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="text-2xl font-bold text-white">0</div>
                                <div className="text-xs text-neutral-500">Saved Builds</div>
                            </div>
                            <Link href="/support" className="block group">
                                <div className="text-2xl font-bold text-white group-hover:text-[#4f9e97] transition-colors">
                                    {ticketCount}
                                </div>
                                <div className="text-xs text-neutral-500 group-hover:text-[#4f9e97] transition-colors">
                                    Support Tickets &rarr;
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Referrals Section */}
                <div className="glass-card p-8 mb-12 border border-[#4f9e97]/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#4f9e97]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                        <span className="bg-[#4f9e97]/20 text-[#4f9e97] p-2 rounded-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                        </span>
                        Earn Free Tokens
                    </h2>
                    <p className="text-neutral-400 mb-6 max-w-2xl text-sm leading-relaxed">
                        Share your unique referral link with friends. When they sign up using your link, <strong className="text-white">you both receive 10 bonus tokens</strong> (enough for 1 Free AI Build!). Top promoters are featured on the Leaderboard.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 w-full relative">
                            <input
                                type="text"
                                readOnly
                                value={`http://localhost:3000/register?ref=${(session?.user as any)?.referral_code || 'loading...'}`}
                                className="w-full bg-black/50 border border-neutral-700 rounded-xl px-4 py-3 text-neutral-300 font-mono text-sm focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={(e) => {
                                navigator.clipboard.writeText(`http://localhost:3000/register?ref=${(session?.user as any)?.referral_code || ''}`);
                                const btn = e.currentTarget;
                                const originalText = btn.innerHTML;
                                btn.innerHTML = 'Copied!';
                                btn.classList.add('bg-[#4f9e97]', 'text-black');
                                btn.classList.remove('bg-white/10', 'text-white');
                                setTimeout(() => {
                                    btn.innerHTML = originalText;
                                    btn.classList.remove('bg-[#4f9e97]', 'text-black');
                                    btn.classList.add('bg-white/10', 'text-white');
                                }, 2000);
                            }}
                            className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/5 flex items-center justify-center min-w-[140px]"
                        >
                            Copy Link
                        </button>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4">Recent Builds</h2>
                <div className="glass-card p-12 text-center text-neutral-500 border border-neutral-800 border-dashed rounded-2xl">
                    <svg className="w-12 h-12 mx-auto mb-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p>You haven't generated any saved builds yet.</p>
                    <Link href="/build" className="text-[#4f9e97] hover:underline mt-2 inline-block">Start your first build</Link>
                </div>
            </div>
        </div>
    );
}
