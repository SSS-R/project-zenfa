"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShadowOverlay } from "@/components/ui/shadow-overlay";

export default function DashboardPage() {
    const { data: session } = useSession();
    const [ticketCount, setTicketCount] = useState(0);

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
                        <div>
                            <Link href="/pricing" className="text-[#4f9e97] hover:text-[#6ee1c9] font-medium border border-[#4f9e97]/30 bg-[#4f9e97]/10 rounded-lg px-4 py-2 transition text-sm">
                                Get More Tokens
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
