"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap } from "lucide-react";

const headlines = [
    "NVIDIA RTX 5070 drops to ৳65k at StarTech",
    "AMD announces Ryzen 9000X3D release date",
    "DDR5 prices hit all-time low in Bangladesh",
    "PC Lagbe reaches 500+ builds generated",
    "RTX 4060 vs RX 7600: Our AI's verdict is in",
];

// Double the list for infinite scroll seamless looping
const marqueeItems = [...headlines, ...headlines];

export function TechHeadlines() {
    return (
        <section className="bg-neutral-950 py-3 border-y border-[#4f9e97]/20 relative z-20 overflow-hidden flex items-center">
            {/* Fixed Breaking Badge on the Left */}
            <div className="absolute left-0 top-0 bottom-0 z-30 flex items-center bg-neutral-950 px-4 md:px-6 shadow-[10px_0_15px_-3px_rgba(10,10,10,1)]">
                <div className="bg-red-500 text-white text-xs font-bold uppercase px-3 py-1.5 rounded-sm flex items-center gap-1.5">
                    <Zap size={14} className="fill-white" />
                    <span>BREAKING</span>
                </div>
            </div>

            {/* Marquee Center */}
            <div
                className="w-full relative ml-[120px] md:ml-[160px] mr-[100px] md:mr-[140px]"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
                }}
            >
                <motion.div
                    className="flex w-max items-center pr-12"
                    animate={{ x: [0, "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 25,
                    }}
                    whileHover={{ animationPlayState: "paused" }}
                >
                    {marqueeItems.map((headline, idx) => (
                        <div key={idx} className="flex items-center group cursor-pointer">
                            <span className="text-sm md:text-base font-medium text-neutral-400 group-hover:text-white transition-colors whitespace-nowrap">
                                {(() => {
                                    const parts = headline.split(/(NVIDIA|RTX \d+|AMD|Ryzen \w+|DDR5|PC Lagbe|RX \d+)/);
                                    return parts.map((part, i) => {
                                        if (["NVIDIA", "RTX 5070", "AMD", "Ryzen 9000X3D", "DDR5", "PC Lagbe", "RTX 4060", "RX 7600"].includes(part)) {
                                            return <strong key={i} className="text-white">{part}</strong>;
                                        }
                                        return <span key={i}>{part}</span>;
                                    });
                                })()}
                            </span>
                            <span className="mx-8 md:mx-12 text-[#4f9e97] text-xs">◆</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Fixed Read More Link on the Right */}
            <div className="absolute right-0 top-0 bottom-0 z-30 flex items-center bg-neutral-950 px-4 md:px-6 shadow-[-10px_0_15px_-3px_rgba(10,10,10,1)]">
                <Link href="/breaking" className="text-xs md:text-sm font-semibold text-neutral-400 hover:text-white transition-colors whitespace-nowrap">
                    Read More →
                </Link>
            </div>
        </section>
    );
}
