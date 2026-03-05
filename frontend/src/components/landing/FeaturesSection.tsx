"use client";

import { motion } from "framer-motion";

const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
    initial: {},
    whileInView: {
        transition: { staggerChildren: 0.1 }
    }
};

export function FeaturesSection() {
    return (
        <section className="min-h-screen bg-black relative overflow-hidden py-24">
            {/* Top glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(79, 158, 151, 0.1) 0%, transparent 70%)',
                }}
            />

            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Smart PC Building
                    </h2>
                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                        Tell us your budget, we&apos;ll find the perfect parts.
                        AI-powered recommendations with real-time price comparison.
                    </p>
                </motion.div>

                {/* Feature Cards - Bento Grid with animations */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Card 1 - Large */}
                    <motion.div
                        className="glass-card-glow p-8 md:col-span-2 lg:col-span-2 group cursor-pointer"
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f9e97] to-[#6ee1c9] flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-[rgba(79,158,151,0.3)] transition-shadow">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">AI Build Generator</h3>
                        <p className="text-neutral-400 leading-relaxed">
                            Enter your budget and intended use case. Our algorithm analyzes compatibility,
                            performance scores, and current prices to recommend the optimal build.
                        </p>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div
                        className="glass-card p-8 group cursor-pointer"
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-6 group-hover:border-[#4f9e97]/50 transition-colors">
                            <svg className="w-6 h-6 text-[#4f9e97]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Price Comparison</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed">
                            Compare prices across StarTech, Ryans, TechLand and more in real-time.
                        </p>
                    </motion.div>

                    {/* Card 3 */}
                    <motion.div
                        className="glass-card p-8 group cursor-pointer"
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-6 group-hover:border-[#4f9e97]/50 transition-colors">
                            <svg className="w-6 h-6 text-[#4f9e97]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Compatibility Check</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed">
                            Automatic validation of socket types, RAM compatibility, and power requirements.
                        </p>
                    </motion.div>

                    {/* Card 4 */}
                    <motion.div
                        className="glass-card p-8 md:col-span-2 lg:col-span-2 group cursor-pointer"
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-6 group-hover:border-[#4f9e97]/50 transition-colors">
                            <svg className="w-6 h-6 text-[#4f9e97]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Smart Swap</h3>
                        <p className="text-neutral-400 leading-relaxed">
                            Don&apos;t like a recommended part? Click &quot;Change&quot; to see compatible alternatives
                            filtered by your existing selections. No more guessing.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
