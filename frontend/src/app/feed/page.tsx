"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUp, MessageSquare, Share2, Trophy, TrendingUp, Clock } from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const feedItems = [
    {
        id: 1,
        type: "build",
        user: "Sultan R.",
        time: "2h ago",
        purpose: "Gaming",
        caption: "Just finished my dream gaming setup! Absolutely loving the performance. Worth every taka.",
        build: {
            cpu: "Ryzen 7 7700X",
            gpu: "RTX 4070",
            ram: "32GB DDR5",
            total: "৳105,000",
            slug: "gaming-beast-105k",
            score: "9.4"
        },
        upvotes: 24,
        comments: 5,
        challenge: null,
    },
    {
        id: 2,
        type: "discussion",
        user: "Mahir K.",
        time: "4h ago",
        purpose: null,
        caption: "RTX 4060 vs RX 7600 for 1080p gaming — which has better value in BD right now?",
        build: null,
        upvotes: 12,
        comments: 18,
        tags: ["#gpu", "#budget", "#bd-prices"],
        challenge: null,
    },
    {
        id: 3,
        type: "build",
        user: "Nusrat J.",
        time: "1d ago",
        purpose: "Editing",
        caption: "My first PC ever! Used PC Lagbe's AI and it picked the perfect parts for video editing.",
        build: {
            cpu: "Core i7-13700K",
            gpu: "RTX 4060 Ti",
            ram: "64GB DDR5",
            total: "৳142,000",
            slug: "editing-station-142k",
            score: "8.9"
        },
        upvotes: 31,
        comments: 9,
        challenge: "Best Editing Build Under ৳150k",
    },
    {
        id: 4,
        type: "discussion",
        user: "Ahmed K.",
        time: "2d ago",
        purpose: null,
        caption: "Is 32GB RAM actually worth it for gaming in 2026 or is 16GB still fine? Drop your opinions.",
        build: null,
        upvotes: 45,
        comments: 32,
        tags: ["#ram", "#gaming", "#ddr5"],
        challenge: null,
    },
];

const tabs = [
    { id: "trending", label: "🔥 Trending", icon: TrendingUp },
    { id: "latest", label: "🕓 Latest", icon: Clock },
    { id: "topbuilds", label: "🏆 Top Builds", icon: Trophy },
    { id: "discussions", label: "💬 Discussions", icon: MessageSquare },
];

const topBuilders = [
    { rank: 1, name: "Sultan R.", builds: 12 },
    { rank: 2, name: "Tanha S.", builds: 9 },
    { rank: 3, name: "Mahir K.", builds: 7 },
];

const trendingTags = ["#gaming", "#under50k", "#rtx4060", "#editing", "#ryzen7", "#budget", "#ddr5", "#first-build"];

const categoryColors: Record<string, string> = {
    Gaming: "bg-[#4f9e97]/10 text-[#4f9e97]",
    Editing: "bg-purple-500/10 text-purple-400",
    Office: "bg-blue-500/10 text-blue-400",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function BuildCard({ item }: { item: typeof feedItems[0] }) {
    const [upvoted, setUpvoted] = useState(false);

    return (
        <motion.div
            className="glass-card p-6 space-y-4 hover:border-neutral-700/60 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Challenge badge */}
            {item.challenge && (
                <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-yellow-500/20">
                    <Trophy size={12} /> Challenge Submission: {item.challenge}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4f9e97] to-neutral-700 flex items-center justify-center text-white font-bold text-sm">
                        {item.user.charAt(0)}
                    </div>
                    <div>
                        <span className="text-white text-sm font-semibold">{item.user}</span>
                        <span className="text-neutral-600 text-xs ml-2">· {item.time}</span>
                    </div>
                </div>
                {item.purpose && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${categoryColors[item.purpose] ?? "bg-neutral-800 text-neutral-400"}`}>
                        {item.purpose}
                    </span>
                )}
            </div>

            {/* Caption */}
            <p className="text-neutral-300 text-sm leading-relaxed">{item.caption}</p>

            {/* Build Preview: only for build type */}
            {item.type === "build" && item.build && (
                <div className="bg-black/40 border border-white/5 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-neutral-400">
                        <span><span className="text-neutral-600 font-mono w-8 inline-block">CPU</span> {item.build.cpu}</span>
                        <span><span className="text-neutral-600 font-mono w-8 inline-block">GPU</span> {item.build.gpu}</span>
                        <span><span className="text-neutral-600 font-mono w-8 inline-block">RAM</span> {item.build.ram}</span>
                        <span className="flex items-center gap-2">
                            <span className="text-white font-bold">{item.build.total}</span>
                            <span className="bg-[#4f9e97]/10 text-[#4f9e97] px-1.5 py-0.5 rounded text-[10px] font-bold">{item.build.score}/10</span>
                        </span>
                    </div>
                    <Link href={`/build/${item.build.slug}`} className="text-xs font-semibold text-[#4f9e97] hover:underline block mt-2">
                        View Full Build →
                    </Link>
                </div>
            )}

            {/* Tags: for discussions */}
            {"tags" in item && item.tags && (
                <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                        <span key={tag} className="text-xs bg-[#4f9e97]/10 text-[#4f9e97] px-2.5 py-0.5 rounded-full cursor-pointer hover:bg-[#4f9e97]/20 transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-5 pt-2 border-t border-white/5">
                <button
                    onClick={() => setUpvoted(v => !v)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${upvoted ? "text-[#4f9e97]" : "text-neutral-500 hover:text-white"}`}
                >
                    <ArrowUp size={14} /> {item.upvotes + (upvoted ? 1 : 0)}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-white transition-colors">
                    <MessageSquare size={14} /> {item.comments} comments
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-white transition-colors ml-auto">
                    <Share2 size={14} /> Share
                </button>
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FeedPage() {
    const [activeTab, setActiveTab] = useState("trending");

    const filtered = feedItems.filter(item => {
        if (activeTab === "topbuilds") return item.type === "build";
        if (activeTab === "discussions") return item.type === "discussion";
        return true; // trending + latest show all
    });

    return (
        <main className="bg-black min-h-screen pt-32 pb-20">
            <div className="max-w-5xl mx-auto px-6">

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">🌐 Community Feed</h1>
                        <p className="text-neutral-500 mt-1">See what Bangladesh&apos;s builders are creating.</p>
                    </div>
                    <Link href="/build">
                        <button className="btn-primary px-5 py-2.5 text-sm">
                            Share a Build
                        </button>
                    </Link>
                </div>

                {/* Tab Bar */}
                <div className="flex gap-1 bg-neutral-900/50 border border-white/5 rounded-xl p-1.5 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                    ? "text-white"
                                    : "text-neutral-500 hover:text-neutral-300"
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="tab-bg"
                                    className="absolute inset-0 bg-[#4f9e97]/20 border border-[#4f9e97]/30 rounded-lg"
                                />
                            )}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

                    {/* Main Feed */}
                    <div className="space-y-4">
                        {filtered.map(item => (
                            <BuildCard key={item.id} item={item} />
                        ))}
                        <div className="text-center py-8">
                            <button className="btn-secondary text-sm px-6 py-2.5">Load More</button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">

                        {/* Weekly Challenge */}
                        <div className="glass-card-glow p-5 border-yellow-500/20">
                            <div className="flex items-center gap-2 mb-3">
                                <Trophy className="w-4 h-4 text-yellow-400" />
                                <h3 className="text-sm font-bold text-white">This Week&apos;s Challenge</h3>
                            </div>
                            <p className="text-neutral-300 font-semibold mb-1">&quot;Best Gaming Build Under ৳60,000&quot;</p>
                            <p className="text-xs text-neutral-500 mb-4">23 submissions · 3 days left</p>
                            <Link href="/build">
                                <button className="w-full btn-primary text-sm py-2">Submit Your Build</button>
                            </Link>
                        </div>

                        {/* Mini Leaderboard */}
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-bold text-white mb-4">🥇 Top Builders This Week</h3>
                            <div className="space-y-3">
                                {topBuilders.map(builder => (
                                    <div key={builder.rank} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-neutral-600 w-4">{builder.rank}.</span>
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4f9e97] to-neutral-800 flex items-center justify-center text-white text-xs font-bold">
                                                {builder.name.charAt(0)}
                                            </div>
                                            <span className="text-sm text-neutral-300">{builder.name}</span>
                                        </div>
                                        <span className="text-xs text-neutral-600">{builder.builds} builds</span>
                                    </div>
                                ))}
                            </div>
                            <Link href="/leaderboard" className="text-xs text-[#4f9e97] hover:underline mt-4 block">
                                Full Leaderboard →
                            </Link>
                        </div>

                        {/* Trending Tags */}
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-bold text-white mb-4">🏷️ Trending Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {trendingTags.map(tag => (
                                    <span key={tag} className="text-xs bg-neutral-800 text-neutral-400 px-2.5 py-1 rounded-full cursor-pointer hover:bg-[#4f9e97]/10 hover:text-[#4f9e97] transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
