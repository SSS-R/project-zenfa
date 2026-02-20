"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getCache, setCache } from "@/utils/cache";
import { LampContainer } from "@/components/ui/lamp";

const CATEGORIES = [
    "All",
    "CPU",
    "GPU",
    "Motherboard",
    "RAM",
    "Storage",
    "PSU",
    "Case",
    "Cooler",
];

interface ComponentData {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    brand: string;
    rating: string;
}

interface PaginationMeta {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

interface ApiResponse {
    items: any[];
    meta: PaginationMeta;
}

export default function ComponentsPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(24); // Items per page

    const [components, setComponents] = useState<ComponentData[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data from API with pagination
    const fetchData = useCallback(async () => {
        const cacheKey = `components-${selectedCategory}-${searchQuery}-${currentPage}-${pageSize}`;
        const cachedData = getCache(cacheKey);

        if (cachedData) {
            setComponents(cachedData.components);
            setMeta(cachedData.meta);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.append("page", currentPage.toString());
            params.append("page_size", pageSize.toString());

            if (selectedCategory !== "All") {
                params.append("category", selectedCategory.toLowerCase());
            }
            if (searchQuery.trim()) {
                params.append("search", searchQuery.trim());
            }

            const apiBase = `http://${window.location.hostname}:8000`;
            const res = await fetch(
                `${apiBase}/components/?${params.toString()}`,
            );

            if (!res.ok) {
                throw new Error(`API error: ${res.status}`);
            }

            const data: ApiResponse = await res.json();

            // Map API data to UI format
            const formatted: ComponentData[] = data.items.map((item: any) => {
                const prices = item.prices || [];
                const bestPrice =
                    prices.length > 0
                        ? Math.min(...prices.map((p: any) => p.price_bdt))
                        : 0;

                return {
                    id: item.id,
                    name: item.name,
                    category: item.component_type.toUpperCase(),
                    price: bestPrice,
                    image: item.image_url || "placeholder",
                    brand: item.brand,
                    rating: (item.performance_score / 20).toFixed(1), // Scale 0-100 to 0-5
                };
            });

            setCache(cacheKey, { components: formatted, meta: data.meta });
            setComponents(formatted);
            setMeta(data.meta);
        } catch (error) {
            console.error("Failed to fetch components:", error);
            setError("Failed to load components. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, searchQuery, currentPage, pageSize]);

    useEffect(() => {
        // Reset to page 1 when filters change
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchData();
        }
    }, [selectedCategory, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [currentPage, fetchData]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const PaginationControls = () => {
        if (!meta || meta.total_pages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;
            const currentPage = meta.page;
            const totalPages = meta.total_pages;

            let startPage = Math.max(
                1,
                currentPage - Math.floor(maxVisiblePages / 2),
            );
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            return pages;
        };

        return (
            <div className="flex justify-center items-center gap-2 mt-12">
                {/* Previous Button */}
                <button
                    onClick={() => setCurrentPage(meta.page - 1)}
                    disabled={!meta.has_prev}
                    className="px-4 py-2 bg-neutral-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors"
                >
                    Previous
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${pageNum === meta.page
                            ? "bg-[#4f9e97] text-white"
                            : "bg-neutral-800 text-white hover:bg-neutral-700"
                            }`}
                    >
                        {pageNum}
                    </button>
                ))}

                {/* Next Button */}
                <button
                    onClick={() => setCurrentPage(meta.page + 1)}
                    disabled={!meta.has_next}
                    className="px-4 py-2 bg-neutral-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors"
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-black text-white px-6 md:px-12 max-w-[1600px] mx-auto">
            <div className="relative z-0 w-[120%] -ml-[10%] xl:w-full xl:ml-0 flex flex-col items-center justify-center -mt-8 pt-8 md:-mt-16 md:pt-16 pointer-events-none">
                <LampContainer className="min-h-[30vh] md:min-h-[40vh] w-full" />
            </div>

            <div className="flex flex-col lg:flex-row gap-8 relative z-10 w-full -mt-24 md:-mt-48">
                {/* Filters Sidebar (Mobile: Top Bar, Desktop: Sidebar) */}
                <aside className="w-full lg:w-64 shrink-0 space-y-8">
                    <div className="glass-card p-6 sticky top-28">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-[#4f9e97]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                />
                            </svg>
                            Filters
                        </h2>

                        {/* Search */}
                        <div className="mb-8">
                            <input
                                type="text"
                                placeholder="Search parts..."
                                value={searchQuery}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:border-[#4f9e97] focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
                                Components
                            </h3>
                            <div className="space-y-1">
                                {CATEGORIES.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() =>
                                            handleCategoryChange(category)
                                        }
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${selectedCategory === category
                                            ? "bg-[#4f9e97]/10 text-[#4f9e97] font-medium"
                                            : "text-neutral-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results Info */}
                        {meta && (
                            <div className="mt-8 p-4 bg-neutral-900/50 rounded-lg">
                                <h3 className="text-sm font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                                    Results
                                </h3>
                                <div className="text-sm text-neutral-300">
                                    <div>
                                        Total: {meta.total.toLocaleString()}
                                    </div>
                                    <div>
                                        Page: {meta.page} of {meta.total_pages}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-6">
                        <h1 className="text-3xl font-bold">
                            {selectedCategory === "All"
                                ? "All Components"
                                : selectedCategory}
                        </h1>
                        <span className="text-neutral-500 text-sm">
                            {loading
                                ? "Loading..."
                                : error
                                    ? "Error loading components"
                                    : meta
                                        ? `Showing ${components.length} of ${meta.total.toLocaleString()} results`
                                        : `${components.length} results`}
                        </span>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-12">
                            <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md mx-auto">
                                <svg
                                    className="w-12 h-12 text-red-400 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                                <h3 className="text-lg font-semibold text-red-400 mb-2">
                                    Error Loading Components
                                </h3>
                                <p className="text-red-300 mb-4">{error}</p>
                                <button
                                    onClick={() => fetchData()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {Array.from({ length: pageSize }).map((_, i) => (
                                <div
                                    key={i}
                                    className="glass-card p-0 overflow-hidden animate-pulse"
                                >
                                    <div className="h-48 bg-neutral-800"></div>
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-neutral-800 rounded w-1/3"></div>
                                        <div className="h-6 bg-neutral-800 rounded w-3/4"></div>
                                        <div className="h-8 bg-neutral-800 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Components Grid */}
                    {!loading && !error && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${selectedCategory}-${searchQuery}-${currentPage}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                            >
                                {components.map((item) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        key={item.id}
                                        className="glass-card group hover:border-[#4f9e97]/50 transition-all duration-300 hover:-translate-y-1 p-0 overflow-hidden"
                                    >
                                        <Link
                                            href={`/components/${item.id}`}
                                            className="block h-full"
                                        >
                                            {/* Image */}
                                            <div className="h-48 bg-neutral-900/50 flex items-center justify-center relative group-hover:bg-neutral-900/30 transition-colors">
                                                {item.image &&
                                                    item.image.startsWith(
                                                        "http",
                                                    ) ? (
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
                                                        In Stock
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
                                                        {item.brand}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-xs text-[#FFC107]">
                                                        <svg
                                                            className="w-3 h-3 fill-current"
                                                            viewBox="0 0 20 20"
                                                        >
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
                                                        <span className="text-xs text-neutral-500 block">
                                                            Best Price
                                                        </span>
                                                        <span className="text-xl font-bold text-white">
                                                            ৳
                                                            {item.price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <button className="p-2 rounded-full bg-white text-black hover:bg-[#4f9e97] hover:text-white transition-colors">
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 4v16m8-8H4"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* Empty State */}
                    {!loading && !error && components.length === 0 && (
                        <div className="text-center py-24">
                            <svg
                                className="w-16 h-16 text-neutral-600 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                            <h3 className="text-xl font-semibold text-neutral-400 mb-2">
                                No components found
                            </h3>
                            <p className="text-neutral-500 mb-6">
                                Try adjusting your search or filter criteria.
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedCategory("All");
                                    setSearchQuery("");
                                    setCurrentPage(1);
                                }}
                                className="px-6 py-3 bg-[#4f9e97] text-white rounded-lg hover:bg-[#4f9e97]/80 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && !error && <PaginationControls />}
                </div>
            </div>
        </main>
    );
}
