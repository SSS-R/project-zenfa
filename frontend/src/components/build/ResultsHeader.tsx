"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Gamepad2, Swords, Crosshair, Zap } from "lucide-react";
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

    // Simple mock performance logic based on price for UI purposes
    // In a real app, the backend would supply these estimated FPS numbers based on the GPU
    const getSimulatedFPS = () => {
        if (purpose !== "gaming") return null;

        if (totalPrice > 150000) return { val: "400+", cbp: "120+" };
        if (totalPrice > 80000) return { val: "240+", cbp: "80+" };
        return { val: "144+", cbp: "60+" };
    };

    const fps = getSimulatedFPS();

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">

            {/* Top Banner: Score & Summary */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden group">

                {/* Decorative Background Glow */}
                <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[200%] bg-primary/5 blur-3xl rounded-full transform rotate-12 pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />

                {/* Score Ring (Simple Implementation using SVG) */}
                <div className="relative flex-shrink-0 w-32 h-32 flex items-center justify-center bg-background rounded-full border-4 border-secondary shadow-inner">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                            cx="64" cy="64" r="60"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-primary/20"
                        />
                        <circle
                            cx="64" cy="64" r="60"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray="377"
                            strokeDashoffset={377 - (377 * (score / 10))}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="text-center">
                        <div className="text-3xl font-extrabold text-foreground">{score.toFixed(1)}</div>
                        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mt-1">out of 10</div>
                    </div>
                </div>

                {/* Text & Guarantee */}
                <div className="flex-1 space-y-4 text-center md:text-left z-10">
                    <div>
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-3">
                            <ShieldCheck className="w-4 h-4" />
                            <span>100% Compatibility Guaranteed</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                            YOUR DREAM PC BUILD
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
                        {summary}
                    </p>

                    {/* Micro Breakdowns (Hidden on very small screens) */}
                    <div className="hidden sm:flex flex-wrap gap-4 pt-2">
                        <div className="space-y-1.5 w-24">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
                                <span>Value</span> <span>{scoresBreakdown.value_score}/3</span>
                            </div>
                            <Progress value={(scoresBreakdown.value_score / 3) * 100} className="h-1.5" />
                        </div>
                        <div className="space-y-1.5 w-24">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
                                <span>Balance</span> <span>{scoresBreakdown.build_balance}/2</span>
                            </div>
                            <Progress value={(scoresBreakdown.build_balance / 2) * 100} className="h-1.5 bg-secondary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Financials & Estimated Performance Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">

                {/* Price Box */}
                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Estimated Price</div>
                        <div className="text-3xl font-mono font-bold text-foreground">{formatBDT(totalPrice)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Remaining Budget</div>
                        <div className="text-lg font-mono font-semibold text-emerald-500">+{formatBDT(remainingBudget)}</div>
                    </div>
                </div>

                {/* Estimated Performance Badges */}
                {fps ? (
                    <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/20 rounded-xl p-5 shadow-sm flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Zap className="w-4 h-4" /> Estimated 1080p Performance
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-background/50 border border-border/50 rounded-lg p-2.5 flex items-center gap-3 backdrop-blur-sm">
                                <div className="bg-indigo-500/20 p-1.5 rounded-md text-indigo-500"><Crosshair className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Valorant / CS2</div>
                                    <div className="text-lg font-black text-foreground">{fps.val} FPS</div>
                                </div>
                            </div>
                            <div className="flex-1 bg-background/50 border border-border/50 rounded-lg p-2.5 flex items-center gap-3 backdrop-blur-sm">
                                <div className="bg-rose-500/20 p-1.5 rounded-md text-rose-500"><Swords className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Cyberpunk 2077</div>
                                    <div className="text-lg font-black text-foreground">{fps.cbp} FPS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm flex items-center justify-center opacity-50">
                        <div className="text-sm font-medium text-muted-foreground">Performance estimates only available for gaming builds.</div>
                    </div>
                )}

            </div>
        </div>
    );
}
