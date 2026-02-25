"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShadowOverlay } from "@/components/ui/shadow-overlay";
import { Trophy, Medal, Award, Users, ArrowLeft } from "lucide-react";

interface LeaderboardUser {
    display_name: string;
    email: string;
    total_referrals: number;
}

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch("http://localhost:8001/leaderboard");
                if (res.ok) {
                    const data = await res.json();
                    setLeaders(data);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getTrophyIcon = (index: number) => {
        if (index === 0) return <Trophy className="text-yellow-400 w-8 h-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />;
        if (index === 1) return <Medal className="text-gray-300 w-7 h-7 drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]" />;
        if (index === 2) return <Award className="text-amber-600 w-6 h-6 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]" />;
        return <span className="text-neutral-500 font-bold text-lg w-6 text-center">{index + 1}</span>;
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 relative overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ShadowOverlay />
                {/* Decorative background glow for leaderboard */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                            Top Promoters
                            <span className="text-yellow-500"><Trophy size={32} /></span>
                        </h1>
                        <p className="text-neutral-400 mt-2">The most active community members referring friends to PC Lagbe.</p>
                    </div>
                </div>

                <div className="glass-card overflow-hidden border border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.05)]">
                    <div className="bg-gradient-to-r from-yellow-500/10 to-transparent p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
                            <Users size={20} /> Hall of Fame
                        </h2>
                        <div className="text-xs font-mono text-neutral-500 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                            LIVE UPDATES
                        </div>
                    </div>

                    <div className="p-0">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
                            </div>
                        ) : leaders.length === 0 ? (
                            <div className="text-center py-16 text-neutral-500">
                                <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                                <p>The leaderboard is currently empty.</p>
                                <p className="text-sm mt-2">Start sharing your referral link to be the first!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {leaders.map((user, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-6 p-6 transition-colors hover:bg-white/[0.02] ${index < 3 ? 'bg-gradient-to-r from-white/[0.03] to-transparent' : ''}`}
                                    >
                                        <div className="flex items-center justify-center w-12 h-12">
                                            {getTrophyIcon(index)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="font-bold text-lg text-white flex items-center gap-2">
                                                {user.display_name}
                                                {index === 0 && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">MVP</span>}
                                            </div>
                                            <div className="text-sm text-neutral-500 font-mono mt-1">
                                                {user.email}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
                                                {user.total_referrals}
                                            </div>
                                            <div className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">
                                                Invites
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-neutral-500">
                    Want to see your name here? Head back to the <Link href="/dashboard" className="text-[#4f9e97] hover:underline">Dashboard</Link> and share your referral link!
                </div>
            </div>
        </div>
    );
}
