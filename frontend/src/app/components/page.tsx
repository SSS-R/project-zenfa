"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// MOCK_COMPONENTS removed
import { useEffect } from "react";
import { getCache, setCache } from "@/utils/cache";

const CATEGORIES = ["All", "CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case", "Cooler"];

export default function ComponentsPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const [components, setComponents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            const cacheKey = `components-${selectedCategory}-${searchQuery}`;
            const cachedData = getCache(cacheKey);

            if (cachedData) {
                setComponents(cachedData);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedCategory !== "All") {
                    params.append("category", selectedCategory.toLowerCase()); // Backend expects lowercase enum
                }
                if (searchQuery) {
                    params.append("search", searchQuery);
                }

                const res = await fetch(`http://127.0.0.1:8000/components/?${params.toString()}`);
                const data = await res.json();

                // Map API data to UI format
                const formatted = data.map((item: any) => {
                    // Find best price
                    const prices = item.prices || [];
                    const bestPrice = prices.length > 0
                        ? Math.min(...prices.map((p: any) => p.price_bdt))
                        : 0;

                    return {
                        id: item.id,
                        name: item.name,
                        category: item.component_type.toUpperCase(),
                        price: bestPrice,
                        // Use real image if available, else placeholder based on type
                        image: item.image_url || "cpu",
                        brand: item.brand,
                        rating: (item.performance_score / 20).toFixed(1) // Scale 0-100 to 0-5
                    };
                });

                setCache(cacheKey, formatted);
                setComponents(formatted);
            } catch (error) {
                console.error("Failed to fetch components:", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [selectedCategory, searchQuery]);

    const filteredComponents = components;

    return (
        <main className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 max-w-[1600px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Filters Sidebar (Mobile: Top Bar, Desktop: Sidebar) */}
                <aside className="w-full lg:w-64 shrink-0 space-y-8">
                    <div className="glass-card p-6 sticky top-28">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#4f9e97]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Filters
                        </h2>

                        {/* Search */}
                        <div className="mb-8">
                            <input
                                type="text"
                                placeholder="Search parts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:border-[#4f9e97] focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">Components</h3>
                            <div className="space-y-1">
                                {CATEGORIES.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${selectedCategory === category
                                            ? 'bg-[#4f9e97]/10 text-[#4f9e97] font-medium'
                                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Mock */}
                        <div className="mt-8">
                            <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">Price Range</h3>
                            <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full w-1/2 bg-[#4f9e97] ml-1/4" />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-6">
                        <h1 className="text-3xl font-bold">
                            {selectedCategory === "All" ? "All Components" : selectedCategory}
                        </h1>
                        <span className="text-neutral-500 text-sm">
                            {loading ? "Loading..." : `Showing ${filteredComponents.length} results`}
                        </span>
                    </div>

                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {filteredComponents.map(item => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                key={item.id}
                                className="glass-card group hover:border-[#4f9e97]/50 transition-all duration-300 hover:-translate-y-1 p-0 overflow-hidden"
                            >
                                <Link href={`/components/${item.id}`} className="block h-full">
                                    {/* Image Placeholder or Actual Image */}
                                    <div className="h-48 bg-neutral-900/50 flex items-center justify-center relative group-hover:bg-neutral-900/30 transition-colors">
                                        {item.image && item.image.startsWith("http") ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-contain p-4 mix-blend-screen"
                                            />
                                        ) : (
                                            <span className="text-neutral-600 text-4xl font-bold opacity-20 group-hover:opacity-40 transition-opacity">
                                                {item.category}
                                            </span>
                                        )}

                                        {/* Vendor Badges */}
                                        <div className="absolute top-4 right-4 flex gap-1">
                                            <span className="bg-neutral-800/80 backdrop-blur-sm text-[10px] px-2 py-1 rounded border border-neutral-700 text-neutral-300">
                                                StarTech
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">{item.brand}</span>
                                            <div className="flex items-center gap-1 text-xs text-[#FFC107]">
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                {item.rating}
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-lg mb-4 line-clamp-2 leading-tight group-hover:text-[#4f9e97] transition-colors">
                                            {item.name}
                                        </h3>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div>
                                                <span className="text-xs text-neutral-500 block">Best Price</span>
                                                <span className="text-xl font-bold text-white">৳{item.price.toLocaleString()}</span>
                                            </div>
                                            <button className="p-2 rounded-full bg-white text-black hover:bg-[#4f9e97] hover:text-white transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
