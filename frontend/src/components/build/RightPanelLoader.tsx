"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const LOADING_MESSAGES = [
    "Analyzing bottleneck margins...",
    "Sourcing best prices from StarTech & Ryans...",
    "AI is finalizing your build..."
];

export function RightPanelLoader() {
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2200);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-card p-6 h-full min-h-[500px] flex flex-col justify-center animate-in fade-in duration-700">
            <div className="flex flex-col items-center text-center space-y-4 mb-10">
                <div className="mb-2 relative">
                    <div className="w-12 h-12 rounded-full border-2 border-neutral-800 border-t-[#4f9e97] animate-spin [animation-duration:1.5s]" />
                </div>
                <h3 className="text-xl font-bold text-neutral-300 transition-opacity duration-500">
                    {LOADING_MESSAGES[msgIndex]}
                </h3>
                <p className="text-neutral-500 max-w-sm text-sm">
                    This takes about 5-8 seconds as the AI evaluates thousands of combinations.
                </p>
            </div>

            <div className="space-y-4 px-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2, duration: 0.5 }}
                        className="flex items-center space-x-4 p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/50"
                    >
                        <Skeleton className="h-10 w-10 rounded-md bg-neutral-800" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3 bg-neutral-800" />
                            <Skeleton className="h-3 w-2/3 bg-neutral-800/50" />
                        </div>
                        <Skeleton className="h-4 w-16 bg-neutral-800" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
