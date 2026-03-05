"use client";

import { motion } from "framer-motion";

const vendors = [
    "StarTech",
    "Ryans",
    "TechLand",
    "Skyland",
    "UCC"
];

// Double the list for infinite scroll seamless looping
const marqueeItems = [...vendors, ...vendors, ...vendors, ...vendors];

export function TrustedVendors() {
    return (
        <section className="bg-black py-12 border-y border-white/5 relative z-10">
            <div className="max-w-7xl mx-auto px-6 text-center mb-6">
                <p className="text-sm font-semibold text-neutral-500 tracking-widest uppercase">
                    Prices sourced from Bangladesh&apos;s top retailers
                </p>
            </div>

            <div className="w-full overflow-hidden relative" style={{
                // CSS Mask to fade out left/right edges
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
            }}>
                {/* Using Framer Motion for infinite seamless marquee */}
                <motion.div
                    className="flex w-max items-center py-4"
                    animate={{ x: [0, "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30,
                    }}
                    whileHover={{ animationPlayState: "paused" }}
                >
                    {marqueeItems.map((vendor, idx) => (
                        <div key={idx} className="flex items-center px-8 cursor-default group transition-opacity duration-300 opacity-50 hover:opacity-100">
                            <span className="text-2xl md:text-3xl font-bold text-neutral-400 group-hover:text-white transition-colors group-hover:drop-shadow-[0_0_8px_rgba(79,158,151,0.8)]">
                                {vendor}
                            </span>
                            <span className="ml-16 text-[#4f9e97]/30 group-hover:text-[#4f9e97] animate-pulse">◆</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
