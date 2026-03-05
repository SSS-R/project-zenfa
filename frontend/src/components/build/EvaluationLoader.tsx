"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Cpu, Zap } from "lucide-react";

const LOADING_MESSAGES = [
    "Architecting base system...",
    "Running Knapsack algorithm for optimal budget...",
    "Sourcing best prices from StarTech & Ryans...",
    "AI is evaluating bottleneck margins...",
    "Finalizing compatibility checks...",
];

export function EvaluationLoader() {
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500); // Rotate roughly every 2.5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-12 px-6 animate-in fade-in duration-700">

            {/* Dynamic Animated Status Text */}
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                    <Zap className="w-8 h-8 text-primary animate-pulse absolute" />
                    <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin [animation-duration:3s]" />
                </div>

                <h2 className="text-2xl font-bold text-foreground">
                    {LOADING_MESSAGES[msgIndex]}
                </h2>
                <p className="text-muted-foreground max-w-md">
                    This usually takes 5-8 seconds depending on the AI's reasoning depth.
                </p>
            </div>

            {/* Skeleton Visualizer */}
            <div className="w-full space-y-4 opacity-70">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-lg bg-primary/20" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-[30%]" />
                        <Skeleton className="h-4 w-[60%]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
