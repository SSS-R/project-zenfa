"use client";

import { motion } from "framer-motion";
import { Brain, Banknote, ShieldCheck, Zap } from "lucide-react";

const valueProps = [
    {
        id: 1,
        icon: Brain,
        title: "No PC Knowledge Needed",
        desc: "Don't know the difference between DDR4 and DDR5? No problem. Just tell us your budget and what you'll use it for. AI handles the rest."
    },
    {
        id: 2,
        icon: Banknote,
        title: "Never Overpay Again",
        desc: "We compare prices across 5+ retailers in real-time. The average user saves ৳3,000–৳8,000 per build vs. going to one shop."
    },
    {
        id: 3,
        icon: ShieldCheck,
        title: "100% Compatible. Guaranteed.",
        desc: "Every build is validated for socket match, RAM type, PSU wattage, and case clearance. Zero guesswork, zero returns."
    },
    {
        id: 4,
        icon: Zap,
        title: "Build in 60 Seconds, Not 6 Hours",
        desc: "No more opening 15 browser tabs and comparing specs. Our AI delivers a complete, scored build instantly. Swap any part you don't like."
    }
];

export function WhyPCLagbe() {
    return (
        <section className="py-24 bg-black relative overflow-hidden z-10">
            {/* Large decorative teal blur */}
            <div
                className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] pointer-events-none rounded-full blur-[140px]"
                style={{ background: 'rgba(79, 158, 151, 0.08)' }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Why Thousands Choose PC Lagbe?
                    </h2>
                    <p className="text-xl text-neutral-400">
                        The PC Builder Bangladesh actually needed.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {valueProps.map((prop, idx) => {
                        const Icon = prop.icon;
                        return (
                            <motion.div
                                key={prop.id}
                                className="glass-card p-8 md:p-10 group"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(26,26,26,0.8)" }}
                                transition={{
                                    duration: 0.5,
                                    delay: idx * 0.1,
                                    scale: { duration: 0.2 },
                                    backgroundColor: { duration: 0.2 }
                                }}
                                viewport={{ once: true }}
                            >
                                <div className="w-14 h-14 rounded-xl bg-[#4f9e97]/10 flex items-center justify-center mb-6 group-hover:bg-[#4f9e97]/20 transition-colors">
                                    <Icon className="w-7 h-7 text-[#4f9e97]" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    {prop.title}
                                </h3>
                                <p className="text-neutral-400 leading-relaxed text-lg">
                                    {prop.desc}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}
