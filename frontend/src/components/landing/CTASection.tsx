"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTASection() {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(79, 158, 151, 0.08) 0%, transparent 60%)',
                }}
            />

            <motion.div
                className="max-w-4xl mx-auto text-center px-6 relative z-10"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to Build?
                </h2>
                <p className="text-xl text-neutral-400 mb-10">
                    Start with your budget range and let our AI do the heavy lifting.
                </p>

                {/* Budget Slider Preview */}
                <motion.div
                    className="glass-card-glow p-8 max-w-xl mx-auto mb-10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <label className="text-neutral-400 text-sm mb-4 block">Budget Range (BDT)</label>
                    <div className="flex items-center gap-4">
                        <span className="text-white font-semibold">৳30,000</span>
                        <div className="flex-1 h-2 bg-neutral-800 rounded-full relative">
                            <motion.div
                                className="absolute left-0 top-0 h-full rounded-full"
                                style={{ background: 'var(--gradient-primary)' }}
                                initial={{ width: "0%" }}
                                whileInView={{ width: "50%" }}
                                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                                viewport={{ once: true }}
                            />
                            <motion.div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer"
                                initial={{ left: "0%" }}
                                whileInView={{ left: "calc(50% - 8px)" }}
                                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                                viewport={{ once: true }}
                            />
                        </div>
                        <span className="text-white font-semibold">৳500,000</span>
                    </div>
                </motion.div>

                <Link href="/build">
                    <motion.button
                        className="btn-primary text-lg px-10 py-4"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Generate My Build
                    </motion.button>
                </Link>
            </motion.div>
        </section>
    );
}
