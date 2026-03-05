"use client";

import { motion } from "framer-motion";

const featuredOffers = [
    {
        id: 1,
        vendor: "StarTech",
        product: "RTX 4060 Ti 8GB",
        variant: "MSI Ventus 2X Black OC",
        originalPrice: "৳58,500",
        salePrice: "৳49,999",
        discount: "14%",
        link: "https://startech.com.bd"
    },
    {
        id: 2,
        vendor: "Ryans",
        product: "Ryzen 5 7600X",
        variant: "Processor (Tray)",
        originalPrice: "৳27,000",
        salePrice: "৳23,500",
        discount: "13%",
        link: "https://ryanscomputers.com"
    },
    {
        id: 3,
        vendor: "TechLand",
        product: "Samsung 980 Pro 1TB",
        variant: "PCIe 4.0 NVMe M.2 SSD",
        originalPrice: "৳13,500",
        salePrice: "৳11,200",
        discount: "17%",
        link: "https://techlandbd.com"
    }
];

export function FeaturedOffers() {
    return (
        <section className="py-24 bg-black relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        🏷️ Featured Offers
                    </h2>
                    <p className="text-neutral-400 text-lg">
                        Hand-picked price drops from top retailers.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredOffers.map((offer, idx) => (
                        <motion.div
                            key={offer.id}
                            className="glass-card p-6 flex flex-col justify-between hover:border-[#4f9e97]/30 transition-colors group"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.15 }}
                            viewport={{ once: true }}
                        >
                            <div>
                                <div className="text-sm font-bold text-neutral-600 uppercase tracking-widest mb-4 opacity-50 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-neutral-600 group-hover:bg-[#4f9e97] transition-colors" />
                                    {offer.vendor}
                                </div>

                                <h3 className="text-xl font-bold text-white leading-tight mb-1">{offer.product}</h3>
                                <p className="text-sm text-neutral-500 mb-6">{offer.variant}</p>
                            </div>

                            <div>
                                <div className="flex items-end gap-3 mb-2">
                                    <span className="text-2xl font-black text-white">{offer.salePrice}</span>
                                    <span className="text-sm text-neutral-600 line-through mb-1">{offer.originalPrice}</span>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <span className="bg-red-500/20 text-red-400 text-xs font-bold rounded-full px-2.5 py-1 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                        {offer.discount} OFF
                                    </span>

                                    <a href={offer.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#4f9e97] hover:underline group-hover:text-[#6ee1c9] transition-colors">
                                        View on {offer.vendor} →
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-neutral-600">Prices auto-updated · Not sponsored</p>
                </div>
            </div>
        </section>
    );
}
