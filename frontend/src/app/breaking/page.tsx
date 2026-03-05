"use client";

import { useState } from "react";
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

// ─── Mock Articles ───────────────────────────────────────────────────────────

const featuredArticle = {
    id: 0,
    category: "GPU",
    badge: "🔴 HOT",
    title: "NVIDIA RTX 5070 Officially Announced — Here's What It Means for BD Prices",
    excerpt: "The RTX 5070 launches at $549 globally. We break down what the BD price will likely be and when you can realistically expect to find one at StarTech or Ryans.",
    meta: "GPU · 2h ago · 3 min read",
    source: "VideoCardz",
    slug: "rtx-5070-bd-pricing",
};

const articles = [
    {
        id: 1,
        category: "RAM",
        title: "DDR5 Prices Hit All-Time Low in Bangladesh",
        excerpt: "A perfect storm of oversupply and falling USD rates has pushed DDR5 kits below the DDR4 equivalent prices.",
        meta: "5h ago · 2 min read",
        source: "TechPowerUp",
        slug: "ddr5-prices-bd-low",
    },
    {
        id: 2,
        category: "CPU",
        title: "Ryzen 9000X3D: Release Date & Expected BD Pricing",
        excerpt: "AMD confirms the Ryzen 9 9900X3D. We estimate Bangladesh availability by late Q2 2026 in the ৳55,000–৳60,000 range.",
        meta: "1d ago · 4 min read",
        source: "VideoCardz",
        slug: "ryzen-9000x3d-bd",
    },
    {
        id: 3,
        category: "GPU",
        title: "RTX 4060 vs RX 7600 — Our AI's Verdict in 2026",
        excerpt: "We ran both builds through our AI engine across three use cases. The results might surprise you.",
        meta: "2d ago · 5 min read",
        source: "Reddit",
        slug: "rtx-4060-vs-rx-7600-2026",
    },
    {
        id: 4,
        category: "Deals",
        title: "StarTech Slashes Prices on 20+ Components This Weekend",
        excerpt: "StarTech's March clearance sale includes some genuinely good deals on RTX 4060 Ti cards and Ryzen 5 CPUs.",
        meta: "3d ago · 2 min read",
        source: "StarTech",
        slug: "startech-march-sale",
    },
    {
        id: 5,
        category: "Benchmarks",
        title: "Is 16GB RAM Still Enough for Gaming in 2026?",
        excerpt: "We tested 8 popular titles with 16GB vs 32GB across three use cases. Here is the definitive answer.",
        meta: "4d ago · 6 min read",
        source: "Tom's Hardware",
        slug: "16gb-vs-32gb-2026",
    },
    {
        id: 6,
        category: "BD News",
        title: "PC Lagbe Hits 500+ Builds Generated — Community Roundup",
        excerpt: "We look back at the most popular builds from the community and what trends they reveal about BD gamers.",
        meta: "5d ago · 3 min read",
        source: "PC Lagbe",
        slug: "500-builds-roundup",
    },
];

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

// ─── Article Grid Card ────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: typeof articles[0] }) {
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
            <div className="p-5">
                <h3 className="text-base font-bold text-white group-hover:text-[#4f9e97] transition-colors line-clamp-2 mb-2">
                    <Link href={`/breaking/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="text-sm text-neutral-400 line-clamp-2 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">{article.meta}</span>
                    <span className="text-xs text-neutral-500">📖 {article.source}</span>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BreakingPage() {
    const [activeCategory, setActiveCategory] = useState("All");

    const filtered = activeCategory === "All"
        ? articles
        : articles.filter(a => a.category === activeCategory);

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
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                        ⚡ Breaking
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
                        {activeCategory === "All" && (
                            <motion.div
                                className="glass-card-glow p-0 overflow-hidden mb-8 grid md:grid-cols-2 group cursor-pointer hover:border-[#4f9e97]/30 transition-colors"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Hero Image */}
                                <div className="aspect-video md:aspect-auto bg-gradient-to-br from-neutral-900 via-neutral-800 to-[#4f9e97]/20 relative flex items-center justify-center min-h-[200px]">
                                    <div className="text-8xl opacity-30 select-none">🖥️</div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50 hidden md:block" />
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-sm animate-pulse">🔴 HOT</span>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-sm ${categoryStyles["GPU"]}`}>GPU</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-white group-hover:text-[#4f9e97] transition-colors mb-4 leading-tight">
                                            <Link href={`/breaking/${featuredArticle.slug}`}>{featuredArticle.title}</Link>
                                        </h2>
                                        <p className="text-neutral-400 leading-relaxed">{featuredArticle.excerpt}</p>
                                    </div>
                                    <div className="mt-6">
                                        <p className="text-xs text-neutral-600 mb-3">{featuredArticle.meta} · 📖 {featuredArticle.source}</p>
                                        <Link href={`/breaking/${featuredArticle.slug}`} className="text-sm font-bold text-[#4f9e97] hover:underline">
                                            Read Article →
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Article Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map(article => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>

                        {/* Load More */}
                        <div className="text-center mt-10">
                            <button className="btn-secondary text-sm px-8 py-3">Load More Articles</button>
                        </div>
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
