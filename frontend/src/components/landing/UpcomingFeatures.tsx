"use client";

import { motion } from "framer-motion";
import { Lock, TrendingDown, Bell } from "lucide-react";

export function UpcomingFeatures() {
    return (
        <section className="py-24 bg-black relative overflow-hidden z-10">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="inline-block px-3 py-1 bg-neutral-800 rounded-full text-xs font-bold text-neutral-400 mb-6 uppercase tracking-widest border border-neutral-700">
                        Roadmap / Q3 2026
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        We&apos;re Just Getting Started.
                    </h2>
                    <p className="text-xl text-neutral-400 mb-8 leading-relaxed">
                        Building the ultimate ecosystem for PC enthusiasts in Bangladesh.
                        Here is a sneak peek at what our engineering team is launching next.
                    </p>

                    <ul className="space-y-6">
                        <li className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                                <TrendingDown className="w-5 h-5 text-[#4f9e97]" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Historic Price Tracking Charts</h4>
                                <p className="text-neutral-500">See if a component&apos;s price is currently inflated or at an all-time low before buying.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                                <Bell className="w-5 h-5 text-[#4f9e97]" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">Price Drop Alerts</h4>
                                <p className="text-neutral-500">Set a target price for that GPU. We&apos;ll email you the second a vendor drops it below your threshold.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                                <Lock className="w-5 h-5 text-neutral-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-neutral-500 mb-1">Used Market Integration [Locked]</h4>
                                <p className="text-neutral-600">Scan Bikroy and Facebook Marketplace for safe, verified used parts alongside new ones.</p>
                            </div>
                        </li>
                    </ul>
                </motion.div>

                {/* Right: Mockup Wireframe UI */}
                <motion.div
                    className="relative lg:ml-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    {/* Decorative Glow Behind UI */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#4f9e97]/20 to-transparent blur-[80px] rounded-full" />

                    <div className="glass-card p-6 relative z-10 border border-[#4f9e97]/20 shadow-[0_0_50px_rgba(79,158,151,0.1)]">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-neutral-800" />
                                <div>
                                    <div className="w-32 h-3 bg-neutral-700 rounded mb-2" />
                                    <div className="w-20 h-2 bg-neutral-800 rounded" />
                                </div>
                            </div>
                            <div className="w-16 h-6 bg-[#4f9e97]/20 rounded-full" />
                        </div>

                        {/* Mock Chart Area */}
                        <div className="h-48 w-full bg-neutral-900/50 rounded-lg border border-neutral-800 flex items-end px-4 gap-2 pb-4 pt-12 relative overflow-hidden mb-6">
                            {/* Chart Grid Lines */}
                            <div className="absolute inset-x-0 top-1/4 h-px bg-white/5" />
                            <div className="absolute inset-x-0 top-2/4 h-px bg-white/5" />
                            <div className="absolute inset-x-0 top-3/4 h-px bg-white/5" />

                            {/* Mock Bars */}
                            <div className="w-full bg-neutral-800 rounded-t-sm h-[60%]" />
                            <div className="w-full bg-neutral-800 rounded-t-sm h-[65%]" />
                            <div className="w-full bg-neutral-800 rounded-t-sm h-[50%]" />
                            <div className="w-full bg-neutral-800 rounded-t-sm h-[55%] relative">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-700 text-[10px] px-2 py-1 rounded">৳58K</div>
                            </div>
                            <div className="w-full bg-neutral-800 rounded-t-sm h-[40%]" />
                            <div className="w-full bg-[#4f9e97]/80 rounded-t-sm h-[30%] relative">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#4f9e97] text-white font-bold text-[10px] px-2 py-1 rounded shadow-lg shadow-[#4f9e97]/20">৳49K</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="w-24 h-8 bg-neutral-800 rounded" />
                            <div className="w-32 h-8 bg-[#4f9e97]/20 border border-[#4f9e97]/50 rounded text-center leading-8 text-xs font-bold text-[#4f9e97]">SET ALERT</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
