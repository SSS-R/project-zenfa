"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const mockActivities = [
    { id: 1, name: "Sultan R.", event: "just built a ৳85k Gaming PC", time: "2m ago" },
    { id: 2, name: "Anonymous Builder", event: "shared a build", time: "5m ago" },
    { id: 3, name: "Tanha S.", event: "earned 10 tokens from a referral", time: "12m ago" },
    { id: 4, name: "Mahir K.", event: "downloaded a build PDF", time: "18m ago" },
    { id: 5, name: "New user", event: "joined from Chittagong", time: "25m ago" },
    { id: 6, name: "Nusrat J.", event: "swapped GPU in her editing build", time: "31m ago" },
    { id: 7, name: "Ahmed K.", event: "just built a ৳65k Office PC", time: "1h ago" },
];

export function LiveActivityFeed() {
    // Use a window of 5 items visible at any given time
    const [items, setItems] = useState(mockActivities.slice(0, 5));
    const [isPaused, setIsPaused] = useState(false);
    const [nextIndex, setNextIndex] = useState(5);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setItems(prevItems => {
                const nextItem = mockActivities[nextIndex % mockActivities.length];

                // Remove the oldest (first) item and add the new one to the bottom
                const newItems = [...prevItems.slice(1), nextItem];
                return newItems;
            });

            setNextIndex(prev => prev + 1);
        }, 3500); // Shift every 3.5 seconds

        return () => clearInterval(interval);
    }, [isPaused, nextIndex]);

    return (
        <section className="py-12 bg-black relative z-10">
            <div
                className="glass-card max-w-md mx-auto p-6"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4f9e97] animate-pulse shadow-[0_0_8px_rgba(79,158,151,0.8)]" />
                    <h3 className="text-sm font-semibold text-neutral-300 tracking-wider">LIVE ON PC LAGBE</h3>
                </div>

                <div className="overflow-hidden h-[240px] relative">
                    <AnimatePresence initial={false}>
                        {items.map((item) => (
                            <motion.div
                                key={`${item.id}-${Math.random()}`} // Force new key for entrance animation to fire correctly if duplicates loop
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="py-3 border-b border-white/5 last:border-0 flex items-start gap-3 justify-between"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-xs mt-1">🟢</span>
                                    <p className="text-sm text-neutral-400">
                                        <span className="text-white font-medium">{item.name}</span> {item.event}
                                    </p>
                                </div>
                                <span className="text-xs text-neutral-600 whitespace-nowrap pt-0.5">{item.time}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
