"use client";

import React, { useEffect, useState } from "react";
import { Coins } from "lucide-react";

interface TokenSpendAnimationProps {
    amount: number;
    triggerId?: string | number; // Change this to re-trigger the animation
}

export function TokenSpendAnimation({ amount, triggerId }: TokenSpendAnimationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (triggerId) {
            setIsVisible(true);
            const timer = setTimeout(() => setIsVisible(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [triggerId, amount]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[100] flex flex-col items-center justify-center animate-in slide-in-from-bottom-10 fade-in duration-500 ease-out zoom-in-50">

            {/* Floating Coin Container */}
            <div className="relative">
                {/* Glow behind the coin */}
                <div className="absolute inset-0 bg-yellow-500/50 rounded-full blur-xl scale-150 animate-pulse" />

                {/* The Coin */}
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.5)] border-4 border-yellow-200/50 flex items-center justify-center relative z-10 animate-bounce [animation-duration:1s]">
                    <Coins className="w-8 h-8 text-yellow-900" />
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-t-full" />
                </div>

                {/* Particles floating up */}
                <div className="absolute -top-4 -left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping [animation-duration:1s] delay-100" />
                <div className="absolute -top-6 -right-2 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping [animation-duration:1.2s] delay-300" />
            </div>

            {/* Text appearing below it */}
            <div className="mt-4 bg-background/80 backdrop-blur-md px-6 py-2 rounded-full border border-border/50 shadow-xl opacity-0 animate-[fadeInUp_0.3s_0.2s_forwards]">
                <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-rose-600">
                    -{amount} Tokens
                </span>
            </div>

            <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </div>
    );
}
