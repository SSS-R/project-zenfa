"use client";

import { motion } from "framer-motion";

const staggerContainer = {
    initial: {},
    whileInView: {
        transition: { staggerChildren: 0.15 }
    }
};

const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
};

const steps = [
    {
        num: "01",
        title: "Set Your Budget & Preferences",
        desc: "Pick your budget range, use case (Gaming, Editing, Office), and optional brand preferences. Takes 10 seconds."
    },
    {
        num: "02",
        title: "AI Architects Your Build",
        desc: "Our AI analyzes 100+ components across compatibility, performance scores, and current prices. You get a full build in seconds — not hours."
    },
    {
        num: "03",
        title: "Buy with Confidence",
        desc: "Every part links directly to StarTech, Ryans, TechLand, and more. Download a PDF to take to the shop. Swap any part you don't like instantly."
    }
];

export function HowItWorks() {
    return (
        <section className="py-24 bg-black relative overflow-hidden text-center z-10">
            {/* Subtle radial glow top-center */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(79, 158, 151, 0.15) 0%, transparent 60%)',
                }}
            />

            <div className="max-w-6xl mx-auto px-6 relative">
                <motion.h2
                    className="text-4xl md:text-5xl font-bold text-white mb-4"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    How It Works
                </motion.h2>
                <motion.p
                    className="text-xl text-neutral-400 mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                >
                    From budget to build in under 60 seconds.
                </motion.p>

                <motion.div
                    className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 relative"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true, margin: "-100px" }}
                >

                    {/* Connective Dashed Line Background (Desktop Only) */}
                    <div className="hidden md:block absolute top-[100px] left-[15%] right-[15%] h-[2px] z-0">
                        <div className="w-full h-full border-t-2 border-dashed border-[#4f9e97]/30" />
                        {/* Animated Dot logic could go here, omitting for simplicity in v1 */}
                    </div>


                    {steps.map((step, idx) => (
                        <motion.div
                            key={step.num}
                            className="glass-card p-8 w-full md:w-1/3 text-left relative overflow-hidden group z-10 bg-neutral-900/80 backdrop-blur-xl"
                            variants={fadeInUp}
                            whileHover={{ scale: 1.02 }}
                        >
                            {/* Background Number Watermark */}
                            <div className="absolute -top-4 -right-2 text-[100px] font-black text-[#4f9e97]/10 select-none group-hover:text-[#4f9e97]/20 transition-colors duration-500">
                                {step.num}
                            </div>

                            {/* Step indicator */}
                            <div className="w-12 h-12 rounded-xl bg-black border border-[#4f9e97]/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(79,158,151,0.15)]">
                                <span className="text-xl font-bold text-[#4f9e97]">{step.num}</span>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-3 relative z-10">{step.title}</h3>
                            <p className="text-neutral-400 leading-relaxed text-sm relative z-10">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
