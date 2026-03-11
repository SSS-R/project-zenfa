"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, TrendingUp } from "lucide-react";

// ─── Category System ────────────────────────────────────────────────────────

const categoryStyles: Record<string, string> = {
    GPU: "bg-[#4f9e97]/10 text-[#4f9e97]",
    CPU: "bg-orange-500/10 text-orange-400",
    "RAM": "bg-purple-500/10 text-purple-400",
    Deals: "bg-red-500/10 text-red-400",
    Benchmarks: "bg-blue-500/10 text-blue-400",
    "BD News": "bg-green-500/10 text-green-400",
};

const categories = ["All", "GPU", "CPU", "RAM", "Deals", "Benchmarks", "BD News"];

// ─── Constants & Mock Data ───────────────────────────────────────────────────────────

const API_TO_UI_CAT: Record<string, string> = {
    "gpu": "GPU",
    "cpu": "CPU",
    "ram_storage": "RAM",
    "deals": "Deals",
    "benchmarks": "Benchmarks",
    "bd_news": "BD News"
};

const priceMovers = [
    { name: "RTX 4060", price: "৳38,500", change: "↓ ৳2,000", pct: "5.2%", down: true },
    { name: "Ryzen 5 7600", price: "৳21,800", change: "↓ ৳1,200", pct: "5.5%", down: true },
    { name: "Kingston 16GB", price: "৳5,500", change: "↑ ৳300", pct: "5.5%", down: false },
];

const redditHot = [
    { title: "\"Is 16GB still enough in 2026?\"", upvotes: "847" },
    { title: "\"My first build after using PC Lagbe\"", upvotes: "423" },
    { title: "\"RX 9070 XT review megathread\"", upvotes: "1.2k" },
];

// Helper to format articles from API
function mapApiArticle(apiData: any) {
    const pubDate = apiData.published_at ? new Date(apiData.published_at) : new Date();
    const isToday = pubDate.toDateString() === new Date().toDateString();
    let timeStr = pubDate.toLocaleDateString();
    if (isToday) {
        // rough hours ago
        const diffMs = Date.now() - pubDate.getTime();
        const diffHrs = Math.max(1, Math.floor(diffMs / 3600000));
        timeStr = `${diffHrs}h ago`;
    }

    return {
        id: apiData.id,
        category: API_TO_UI_CAT[apiData.category] || "BD News",
        title: apiData.title,
        excerpt: apiData.excerpt,
        meta: `${timeStr} · ${apiData.read_time_minutes || 2} min read`,
        source: apiData.source_name || "News Source",
        slug: apiData.slug,
    };
}

// ─── Article Grid Card ────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: any }) {
    const catStyle = categoryStyles[article.category] ?? "bg-neutral-800 text-neutral-400";

    return (
        <motion.div
            className="glass-card overflow-hidden group cursor-pointer hover:border-neutral-600/50 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Thumbnail Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-neutral-900 to-neutral-800 relative flex items-center justify-center overflow-hidden">
                <div className="text-5xl opacity-20 select-none">
                    {article.category === "GPU" ? "🖥️" : article.category === "CPU" ? "⚙️" : article.category === "RAM" ? "💾" : article.category === "Deals" ? "🏷️" : article.category === "Benchmarks" ? "📊" : "🇧🇩"}
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm ${catStyle}`}>
                    {article.category}
                </span>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col justify-between" style={{ minHeight: "180px" }}>
                <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#4f9e97] transition-colors line-clamp-2 mb-2">
                        <Link href={`/breaking/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="text-sm text-neutral-400 line-clamp-2 mb-4">{article.excerpt}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-neutral-800">
                    <span className="text-xs text-neutral-600">{article.meta}</span>
                    <span className="text-xs text-neutral-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">📖 {article.source}</span>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BreakingPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [articles, setArticles] = useState<any[]>([]);
    const [featuredArticle, setFeaturedArticle] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch articles from the B2C Backend
    useEffect(() => {
        async function fetchNews() {
            setLoading(true);
            try {
                // Fetch the featured article (if any is marked)
                let tempFeatured = null;
                try {
                    const featRes = await fetch("http://localhost:8001/articles/featured");
                    if (featRes.ok) {
                        const featData = await featRes.json();
                        tempFeatured = mapApiArticle(featData);
                    }
                } catch (e) {
                    // ignore if no featured article
                }
                
                // Fetch the list of articles
                const res = await fetch("http://localhost:8001/articles?limit=15");
                if (res.ok) {
                    const data = await res.json();
                    const mappedArticles = data.map(mapApiArticle);
                    
                    if (tempFeatured) {
                        setFeaturedArticle(tempFeatured);
                        // Make sure featured isn't duplicated in the list
                        setArticles(mappedArticles.filter((a: any) => a.id !== tempFeatured.id));
                    } else if (mappedArticles.length > 0) {
                        // Fallback: use newest as featured
                        setFeaturedArticle(mappedArticles[0]);
                        setArticles(mappedArticles.slice(1));
                    } else {
                        setArticles([]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch news", err);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, []);

    const filtered = activeCategory === "All"
        ? articles
        : articles.filter((a: any) => a.category === activeCategory);

    return (
        <main className="bg-black min-h-screen pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* Page Header */}
                <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 flex items-center gap-3">
                        ⚡ Breaking 
                        {loading && <span className="text-sm font-normal text-neutral-500 animate-pulse bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">Syncing Feed...</span>}
                    </h1>
                    <p className="text-lg text-neutral-400">
                        The latest in PC hardware, prices, and tech — filtered for Bangladesh.
                    </p>
                </motion.div>

                {/* Category Filter Bar */}
                <div className="flex gap-2 mb-10 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${activeCategory === cat
                                    ? "bg-[#4f9e97] text-black border-[#4f9e97]"
                                    : "bg-transparent text-neutral-400 border-neutral-700 hover:border-neutral-500 hover:text-white"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Two-Column Layout: Articles + Sidebar */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
                    <div>
                        {/* Featured / Hero Article */}
                        {activeCategory === "All" && featuredArticle && !loading && (
                            <motion.div
                                className="glass-card-glow p-0 overflow-hidden mb-8 grid md:grid-cols-2 group cursor-pointer hover:border-[#4f9e97]/30 transition-colors"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Hero Image */}
                                <div className="aspect-video md:aspect-auto bg-gradient-to-br from-neutral-900 via-neutral-800 to-[#4f9e97]/20 relative flex items-center justify-center min-h-[250px]">
                                    <div className="text-8xl opacity-30 select-none">
                                         {featuredArticle.category === "GPU" ? "🖥️" : featuredArticle.category === "CPU" ? "⚙️" : featuredArticle.category === "RAM" ? "💾" : featuredArticle.category === "Deals" ? "🏷️" : featuredArticle.category === "Benchmarks" ? "📊" : "🇧🇩"}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50 hidden md:block" />
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-sm animate-pulse">🔴 HOT</span>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-sm ${categoryStyles[featuredArticle.category] || categoryStyles["BD News"]}`}>{featuredArticle.category}</span>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black text-white group-hover:text-[#4f9e97] transition-colors mb-4 leading-tight">
                                            <Link href={`/breaking/${featuredArticle.slug}`}>{featuredArticle.title}</Link>
                                        </h2>
                                        <p className="text-neutral-400 line-clamp-3 leading-relaxed">{featuredArticle.excerpt}</p>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t border-neutral-800 pt-4">
                                        <p className="text-xs text-neutral-600 truncate max-w-[150px]">{featuredArticle.meta} · 📖 {featuredArticle.source}</p>
                                        <Link href={`/breaking/${featuredArticle.slug}`} className="text-sm font-bold text-[#4f9e97] hover:underline whitespace-nowrap ml-4">
                                            Read Article →
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Article Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {loading ? (
                                // Skeletons while fetching
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="glass-card h-64 animate-pulse bg-neutral-900/50"></div>
                                ))
                            ) : filtered.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-neutral-500">
                                    No articles found for this category yet.
                                </div>
                            ) : (
                                filtered.map((article: any) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))
                            )}
                        </div>

                        {/* Load More */}
                        {!loading && filtered.length > 0 && (
                            <div className="text-center mt-10">
                                <button className="btn-secondary text-sm px-8 py-3">Load More Articles</button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5 xl:sticky xl:top-28 xl:self-start">

                        {/* Price Movers */}
                        <div className="glass-card p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-[#4f9e97]" />
                                <h3 className="text-sm font-bold text-white">📉 Price Movers Today</h3>
                            </div>
                            <div className="space-y-3">
                                {priceMovers.map(item => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-neutral-300 font-medium">{item.name}</p>
                                            <p className="text-xs text-neutral-500">{item.price}</p>
                                        </div>
                                        <span className={`text-xs font-bold ${item.down ? "text-green-400" : "text-red-400"}`}>
                                            {item.change}
                                            <span className="text-neutral-600 font-normal ml-1">({item.pct})</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hot on Reddit */}
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-bold text-white mb-4">🔥 Hot on r/buildapc</h3>
                            <div className="space-y-3">
                                {redditHot.map(item => (
                                    <div key={item.title} className="flex items-start justify-between gap-3">
                                        <p className="text-sm text-neutral-400 leading-snug hover:text-white cursor-pointer transition-colors">{item.title}</p>
                                        <span className="text-xs text-neutral-600 shrink-0">▲ {item.upvotes}</span>
                                    </div>
                                ))}
                            </div>
                            <a href="https://reddit.com/r/buildapc" target="_blank" rel="noopener noreferrer" className="text-xs text-[#4f9e97] hover:underline mt-4 block">
                                Visit r/buildapc →
                            </a>
                        </div>

                        {/* CTA */}
                        <div className="glass-card-glow p-5 text-center">
                            <p className="text-sm text-neutral-400 mb-4">Ready to build? Let our AI architect your perfect PC.</p>
                            <Link href="/build">
                                <button className="w-full btn-primary py-2 text-sm">Generate My Build →</button>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
