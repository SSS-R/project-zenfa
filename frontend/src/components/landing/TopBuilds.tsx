"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const topBuilds = [
    {
        id: 1,
        purpose: "Gaming Beast",
        emoji: "🎮",
        score: 9.4,
        cpu: "Ryzen 7 7700X",
        gpu: "RTX 4070 SUPER",
        ram: "32GB DDR5-6000",
        price: "৳155,000",
        builder: "Sultan R.",
        time: "2d",
        slug: "gaming-beast-155k"
    },
    {
        id: 2,
        purpose: "Editing Station",
        emoji: "🎬",
        score: 8.9,
        cpu: "Core i7-13700K",
        gpu: "RTX 4060 Ti",
        ram: "64GB DDR5",
        price: "৳142,000",
        builder: "Tanha S.",
        time: "5d",
        slug: "editing-station-142k"
    },
    {
        id: 3,
        purpose: "Budget Esports",
        emoji: "⚡",
        score: 9.1,
        cpu: "Core i5-12400F",
        gpu: "RTX 3060 12GB",
        ram: "16GB DDR4",
        price: "৳72,000",
        builder: "Mahir K.",
        time: "1w",
        slug: "budget-esports-72k"
    },
    {
        id: 4,
        purpose: "Office Master",
        emoji: "🏢",
        score: 9.8,
        cpu: "Core i5-13400",
        gpu: "Integrated Graphics",
        ram: "16GB DDR5",
        price: "৳58,000",
        builder: "Nusrat J.",
        time: "1w",
        slug: "office-master-58k"
    }
];

export function TopBuilds() {
    return (
        <section className="py-24 bg-black relative overflow-hidden text-left z-10">
            {/* Subtle off-center glow */}
            <div
                className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] pointer-events-none rounded-full blur-[120px]"
                style={{ background: 'rgba(79, 158, 151, 0.08)' }}
            />

            <div className="max-w-7xl mx-auto px-6 mb-12 relative z-10">
                <motion.h2
                    className="text-4xl font-bold text-white mb-3"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    🔥 Top Builds This Week
                </motion.h2>
                <motion.p
                    className="text-neutral-400 text-lg"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                >
                    See what the community is building.
                </motion.p>
            </div>

            {/* Horizontal Snap Scroll Container */}
            <div className="w-full overflow-hidden relative">
                {/*
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          These arbitrary classes hide the scrollbar completely in Tailwind.
        */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 md:px-[calc((100vw-80rem)/2)] pb-8 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {topBuilds.map((build, idx) => {
                        const isFirst = idx === 0;
                        return (
                            <motion.div
                                key={build.id}
                                className={`snap-start flex-shrink-0 w-[320px] p-6 flex flex-col justify-between ${isFirst ? 'glass-card-glow' : 'glass-card'} transition-transform hover:-translate-y-1`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <span>{build.emoji}</span> {build.purpose}
                                        </h3>
                                        <div className="px-2.5 py-1 bg-[#4f9e97]/20 text-[#4f9e97] rounded-full text-xs font-bold border border-[#4f9e97]/30">
                                            {build.score}/10
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="text-xs font-bold text-neutral-600 uppercase tracking-widest border-b border-white/5 pb-2">Components</div>
                                        <div className="text-sm text-neutral-300"><span className="text-neutral-500 w-10 inline-block font-mono">CPU</span> {build.cpu}</div>
                                        <div className="text-sm text-neutral-300"><span className="text-neutral-500 w-10 inline-block font-mono">GPU</span> {build.gpu}</div>
                                        <div className="text-sm text-neutral-300"><span className="text-neutral-500 w-10 inline-block font-mono">RAM</span> {build.ram}</div>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="text-2xl font-black text-white mb-4">{build.price}</div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-neutral-500">by {build.builder} · {build.time} ago</span>
                                        <Link href={`/build/${build.slug}`} className="text-sm font-semibold text-[#4f9e97] hover:underline">
                                            View Build →
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            <div className="mt-8 text-center">
                <Link href="/builds" className="inline-block text-[#4f9e97] font-semibold hover:text-[#6ee1c9] transition-colors">
                    See All Builds →
                </Link>
            </div>
        </section>
    );
}
