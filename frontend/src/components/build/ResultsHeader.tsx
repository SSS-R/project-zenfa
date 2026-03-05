"use client";

import React from "react";
import { ShieldCheck, Swords, Crosshair, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResultsHeaderProps {
    score: number;
    summary: string;
    totalPrice: number;
    remainingBudget: number;
    purpose: "gaming" | "editing" | "office" | "general";
    scoresBreakdown: {
        performance_match: number; // out of 3
        value_score: number;       // out of 3
        build_balance: number;     // out of 2
        future_proofing: number;   // out of 1
        community_trust: number;   // out of 1
    };
}

export function ResultsHeader({ score, summary, totalPrice, remainingBudget, purpose, scoresBreakdown }: ResultsHeaderProps) {
    const formatBDT = (num: number) => `৳${num.toLocaleString("en-IN")}`;

    const getSimulatedFPS = () => {
        if (purpose !== "gaming") return null;

        if (totalPrice > 150000) return { val: "400+", cbp: "120+" };
        if (totalPrice > 80000) return { val: "240+", cbp: "80+" };
        return { val: "144+", cbp: "60+" };
    };

    const fps = getSimulatedFPS();

    return (
        <div className="w-full mb-6 space-y-4 animate-in fade-in duration-700">

            {/* Top Banner: Score & Summary */}
            <div className="glass-card md:p-6 p-5 border-l-4 border-l-[#4f9e97]">
                <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start md:items-center">

                    {/* Compact Score Block */}
                    <div className="flex-shrink-0 text-center md:pr-8 md:border-r border-neutral-800/50">
                        <div className="text-4xl sm:text-5xl font-black text-white">{score.toFixed(1)}</div>
                        <div className="text-[10px] sm:text-xs font-bold tracking-widest text-[#4f9e97] uppercase mt-1">out of 10</div>
                    </div>

                    {/* Text block */}
                    <div className="flex-1 space-y-2.5">
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#4f9e97]/10 border border-[#4f9e97]/20 text-[#4f9e97] text-xs font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4" />
                            <span>100% Compatibility Checked</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            The Engineered Core
                        </h2>
                        <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
                            {summary}
                        </p>
                    </div>
                </div>
            </div>

            {/* Financials & Estimated Performance Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Price Box */}
                <div className="flex items-center justify-between bg-neutral-900/40 border border-neutral-800/50 p-5 rounded-xl">
                    <div>
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Total Build Price</div>
                        <div className="text-2xl sm:text-3xl font-mono font-bold text-white">{formatBDT(totalPrice)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Under Budget</div>
                        <div className="text-lg font-mono font-bold text-[#4f9e97]">+{formatBDT(remainingBudget)}</div>
                    </div>
                </div>

                {/* Estimated Performance Badges */}
                {fps ? (
                    <div className="bg-neutral-900/40 border border-[#4f9e97]/20 p-5 rounded-xl flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4f9e97]/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                        <div className="text-[10px] font-bold text-[#4f9e97] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Zap className="w-4 h-4" /> Estimated 1080p Performance
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-black/40 border border-neutral-800 rounded-lg p-2.5 flex items-center gap-3">
                                <div className="text-neutral-500"><Crosshair className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-[9px] font-bold text-neutral-500 uppercase">Esports / Val</div>
                                    <div className="text-base sm:text-lg font-black text-white">{fps.val} FPS</div>
                                </div>
                            </div>
                            <div className="flex-1 bg-black/40 border border-neutral-800 rounded-lg p-2.5 flex items-center gap-3">
                                <div className="text-rose-500/50"><Swords className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-[9px] font-bold text-neutral-500 uppercase">AAA Titles</div>
                                    <div className="text-base sm:text-lg font-black text-white">{fps.cbp} FPS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-neutral-900/40 border border-neutral-800/50 p-5 rounded-xl flex items-center justify-center">
                        <div className="text-sm font-medium text-neutral-500">Performance estimates available for gaming configurations.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
