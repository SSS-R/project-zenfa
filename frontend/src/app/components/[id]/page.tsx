"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

// Mock Data
const MOCK_COMPONENTS = [
    {
        id: 1,
        name: "AMD Ryzen 5 7600X",
        category: "CPU",
        price: 24500,
        image: "cpu",
        brand: "AMD",
        rating: 4.8,
        description: "The AMD Ryzen 5 7600X is a desktop processor with 6 cores, launched in September 2022. It is part of the Ryzen 5 lineup, using the Zen 4 (Raphael) architecture with Socket AM5. Thanks to AMD Simultaneous Multithreading (SMT) the core-count is effectively doubled, to 12 threads. Ryzen 5 7600X has 32MB of L3 cache and operates at 4.7 GHz by default, but can boost up to 5.3 GHz, depending on the workload.",
        detailedSpecs: {
            "Basic Information": {
                "Base Frequency": "4.7GHz",
                "Turbo Frequency": "Up to 5.3GHz",
                "Cache": "Total L1: 384KB, Total L2: 6MB, Total L3: 32MB",
                "Cores": "6",
                "Threads": "12",
                "Default TDP": "105W",
                "Socket": "AM5"
            },
            "Memory Specifications": {
                "Maximum Speed": "5200MHz",
                "Type": "DDR5",
                "Max Number of Channels": "2"
            },
            "Graphics Specifications": {
                "Processor Graphics": "AMD Radeon Graphics",
                "Graphics Frequency": "2200 MHz",
                "Core Count": "2"
            },
            "Warranty Information": {
                "Manufacturing Warranty": "Check vendor's website"
            }
        },
        reviews: [
            { id: 1, user: "Rahim A.", rating: 5, date: "2 days ago", comment: "Beast of a processor for gaming. Temps are a bit high but manageable with a good cooler." },
            { id: 2, user: "Karim S.", rating: 4, date: "1 week ago", comment: "Great performance but the platform cost (DDR5 + Mobo) is still a bit high." }
        ]
    },
    // ... Other components would just have basic data for now to avoid huge file size
    { id: 2, name: "Intel Core i5-13600K", category: "CPU", price: 32000, image: "cpu-intel", brand: "Intel", rating: 4.9, detailedSpecs: {}, reviews: [] },
    { id: 3, name: "NVIDIA RTX 4060 Ti", category: "GPU", price: 45000, image: "gpu", brand: "NVIDIA", rating: 4.7, detailedSpecs: {}, reviews: [] },
    { id: 4, name: "G.Skill Trident Z5 32GB", category: "RAM", price: 14500, image: "ram", brand: "G.Skill", rating: 4.9, detailedSpecs: {}, reviews: [] },
    { id: 5, name: "Samsung 990 Pro 1TB", category: "Storage", price: 11500, image: "ssd", brand: "Samsung", rating: 5.0, detailedSpecs: {}, reviews: [] },
    { id: 6, name: "NZXT Kraken Elite 360", category: "Cooler", price: 28000, image: "cooler", brand: "NZXT", rating: 4.6, detailedSpecs: {}, reviews: [] },
    { id: 7, name: "Lian Li O11 Vision", category: "Case", price: 16500, image: "case", brand: "Lian Li", rating: 4.8, detailedSpecs: {}, reviews: [] },
    { id: 8, name: "Corsair RM850e", category: "PSU", price: 13500, image: "psu", brand: "Corsair", rating: 4.7, detailedSpecs: {}, reviews: [] },
];

const MOCK_PRICES = [
    { vendor: "StarTech", price: 24500, url: "#", lastUpdated: "2 mins ago", inStock: true },
    { vendor: "Ryans", price: 25200, url: "#", lastUpdated: "1 hour ago", inStock: true },
    { vendor: "TechLand", price: 24800, url: "#", lastUpdated: "5 hours ago", inStock: false },
    { vendor: "Skyland", price: 24000, url: "#", lastUpdated: "1 day ago", inStock: true },
    { vendor: "Ultratech", price: 25500, url: "#", lastUpdated: "30 mins ago", inStock: true },
];

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const componentId = parseInt(resolvedParams.id);

    // State for component data
    const [component, setComponent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const [activeTab, setActiveTab] = useState("Specification");

    useEffect(() => {
        const fetchComponent = async () => {
            try {
                const apiBase = `http://${window.location.hostname}:8000`;
                const res = await fetch(`${apiBase}/components/${componentId}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Component not found");
                    throw new Error("Failed to fetch component");
                }
                const data = await res.json();

                // Transform API data to match UI structure
                const formattedComponent = {
                    id: data.id,
                    name: data.name,
                    category: data.component_type.toUpperCase(),
                    brand: data.brand || "Unknown",
                    image: data.image_url,
                    rating: data.performance_score ? (data.performance_score / 10).toFixed(1) : "N/A", // mapped score to rating
                    description: `Product ID: ${data.id}. Type: ${data.component_type}.`,
                    prices: data.prices.map((p: any) => ({
                        vendor: p.vendor_name,
                        price: p.price_bdt,
                        url: p.url,
                        lastUpdated: new Date(p.last_updated).toLocaleDateString(),
                        inStock: p.in_stock
                    })),
                    // Keep mock detailedSpecs for now as backend doesn't serve it yet
                    detailedSpecs: {
                        "General": {
                            "Type": data.component_type,
                            "Brand": data.brand
                        }
                    },
                    reviews: [] // No reviews in backend yet
                };

                setComponent(formattedComponent);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (componentId) {
            fetchComponent();
        }
    }, [componentId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-[#4f9e97]">Loading...</div>
            </div>
        );
    }

    if (error || !component) {

        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Component Not Found</h1>
                    <Link href="/components" className="text-[#4f9e97] hover:underline">
                        &larr; Back to Components
                    </Link>
                </div>
            </div>
        );
    }

    const sortedPrices = component.prices ? [...component.prices].sort((a: any, b: any) => a.price - b.price) : [];
    const bestPrice = sortedPrices.length > 0 ? sortedPrices[0] : null;

    return (
        <main className="min-h-screen bg-transparent text-white pt-24 px-6 md:px-12 max-w-[1400px] mx-auto pb-20 relative">
            <AnimatedShaderBackground />
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
                <Link href="/components" className="hover:text-white transition-colors">Components</Link>
                <span>/</span>
                <span className="text-white">{component.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                {/* Left Column: Product Info & Image */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Image Placeholder or Actual Image */}
                    <div className="aspect-square bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-neutral-600 relative overflow-hidden">
                        {component.image && component.image.startsWith("http") ? (
                            <img
                                src={component.image}
                                alt={component.name}
                                className="w-full h-full object-contain p-8 mix-blend-screen"
                            />
                        ) : (
                            <>
                                {/* Mock Banner */}
                                <div className="absolute top-0 left-0 right-0 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider text-center py-1">
                                    📷 Mock Product Image
                                </div>

                                {/* Icon */}
                                <svg className="w-20 h-20 text-neutral-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>

                                <span className="text-neutral-500 text-4xl font-bold mb-2">
                                    {component.category}
                                </span>
                                <span className="text-neutral-600 text-xs uppercase tracking-wider">
                                    Image will load from API
                                </span>
                            </>
                        )}
                    </div>

                    {/* Key Specs Summary */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-4 border-b border-neutral-800 pb-2">Key Features</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Brand</span>
                                <span className="font-medium">{component.brand}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Model</span>
                                <span className="font-medium">{component.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Rating</span>
                                <span className="text-[#FFC107] font-medium flex items-center gap-1">
                                    {component.rating}
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mock Advertisement Placeholder */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl border border-purple-500/30 p-4 relative overflow-hidden">
                        <div className="absolute top-2 right-2 bg-neutral-800/80 text-[10px] px-2 py-0.5 rounded text-neutral-400 uppercase tracking-wider">Ad</div>
                        <div className="text-center">
                            <h4 className="font-bold text-white text-sm mb-1">🔥 Special Offer!</h4>
                            <p className="text-xs text-neutral-300 mb-2">10% off AMD CPUs at <span className="text-[#4f9e97]">StarTech</span></p>
                            <button className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] px-3 py-1 rounded font-bold">View Deal →</button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Name, Best Price, Vendor List */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{component.name}</h1>
                        <p className="text-neutral-400">
                            {component.category} • {component.brand}
                        </p>
                    </div>

                    {/* Best Price Card */}
                    <div className="bg-gradient-to-r from-[#4f9e97]/20 to-transparent border border-[#4f9e97]/30 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <span className="text-[#4f9e97] font-bold text-sm uppercase tracking-wider mb-1 block">Best Price Found</span>
                            {bestPrice ? (
                                <>
                                    <div className="text-3xl font-bold text-white">৳{bestPrice.price.toLocaleString()}</div>
                                    <div className="text-sm text-neutral-400 mt-1">
                                        Available at <span className="text-white font-medium">{bestPrice.vendor}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-xl text-neutral-400">No prices available</div>
                            )}
                        </div>
                        {bestPrice && (
                            <button
                                onClick={() => window.open(bestPrice.url, '_blank')}
                                className="bg-[#4f9e97] hover:bg-[#3d8b85] text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg shadow-[#4f9e97]/20"
                            >
                                Visit Store
                            </button>
                        )}
                    </div>

                    {/* Price Comparison Table */}
                    <div>
                        <h3 className="text-xl font-bold mb-6">Vendor Prices</h3>
                        <div className="space-y-4">
                            {sortedPrices.map((offer: any, index: number) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={offer.vendor}
                                    className="glass-card p-4 flex items-center justify-between group hover:border-neutral-600 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-xs font-bold text-neutral-500">
                                            {offer.vendor[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{offer.vendor}</div>
                                            <div className="text-xs text-neutral-500 flex gap-2">
                                                <span>Updated {offer.lastUpdated}</span>
                                                {offer.inStock ? (
                                                    <span className="text-green-500">• In Stock</span>
                                                ) : (
                                                    <span className="text-red-500">• Out of Stock</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xl font-bold text-white group-hover:text-[#4f9e97] transition-colors">
                                            ৳{offer.price.toLocaleString()}
                                        </div>
                                        <button
                                            onClick={() => window.open(offer.url, '_blank')}
                                            className="text-xs text-neutral-400 hover:text-white underline mt-1"
                                        >
                                            View Offer
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs Navigation */}
            <div className="flex border-b border-neutral-800 mb-8 overflow-x-auto">
                {["Specification", "Description", "Reviews"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 text-sm font-bold uppercase tracking-wider relative whitespace-nowrap ${activeTab === tab
                            ? "text-[#4f9e97]"
                            : "text-neutral-400 hover:text-white"
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-1 bg-[#4f9e97]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Sections */}
            <div className="space-y-12">
                {/* Specifications */}
                {(activeTab === "Specification" && component.detailedSpecs) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-0 overflow-hidden"
                    >
                        <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                            <h2 className="text-xl font-bold">Specification</h2>
                        </div>
                        {Object.entries(component.detailedSpecs).length > 0 ? (
                            <div className="p-6 space-y-8">
                                {Object.entries(component.detailedSpecs).map(([category, specs]) => (
                                    <div key={category}>
                                        <h3 className="text-[#4f9e97] font-bold uppercase tracking-wider text-sm mb-4 bg-[#4f9e97]/10 inline-block px-3 py-1 rounded">
                                            {category}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-y-0 text-sm">
                                            {Object.entries(specs as Record<string, string>).map(([key, value], idx) => (
                                                <div
                                                    key={key}
                                                    className={`grid grid-cols-1 md:grid-cols-3 py-3 border-b border-neutral-800/50 ${idx === 0 ? 'border-t' : ''}`}
                                                >
                                                    <div className="text-neutral-400 font-medium md:col-span-1">{key}</div>
                                                    <div className="text-white md:col-span-2">{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-neutral-500">
                                Detailed specifications not available for this product.
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Description */}
                {(activeTab === "Description") && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-8"
                    >
                        <h2 className="text-xl font-bold mb-6">Description</h2>
                        <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed">
                            <p>{component.description || "No description available."}</p>
                        </div>
                    </motion.div>
                )}

                {/* Reviews */}
                {(activeTab === "Reviews") && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold">Reviews ({component.reviews?.length || 0})</h2>
                            <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors">
                                Write a Review
                            </button>
                        </div>

                        <div className="space-y-6">
                            {(component.reviews && component.reviews.length > 0) ? component.reviews.map((review: any) => (
                                <div key={review.id} className="border-b border-neutral-800 pb-6 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-bold flex items-center gap-2">
                                            {review.user}
                                            <span className="text-[#FFC107] flex text-xs">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-neutral-700 fill-current"}`} viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </span>
                                        </div>
                                        <span className="text-xs text-neutral-500">{review.date}</span>
                                    </div>
                                    <p className="text-neutral-300 text-sm">{review.comment}</p>
                                </div>
                            )) : (
                                <div className="text-center text-neutral-500 py-8">
                                    No reviews yet. Be the first to review!
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </main >
    );
}
