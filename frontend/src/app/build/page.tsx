"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SplineBackground from "@/components/SplineBackground";
import { WizardWrapper } from "@/components/build/WizardWrapper";
import { ResultsHeader } from "@/components/build/ResultsHeader";
import { ComponentList } from "@/components/build/ComponentList";
import { BuildFooter } from "@/components/build/BuildFooter";
import { SwapModal } from "@/components/build/SwapModal";
import { TokenSpendAnimation } from "@/components/ui/TokenSpendAnimation";
import { RightPanelLoader } from "@/components/build/RightPanelLoader";
import { BuildRequest } from "@/lib/schemas";

// Re-using local interface for Mock Data
interface ComponentData {
    id: number;
    name: string;
    component_type: "cpu" | "gpu" | "motherboard" | "ram" | "storage" | "psu" | "case" | "cooler";
    price_bdt: number;
    vendor_name: string;
    vendor_url: string;
    justification?: string;
}

// Mock Response generated after the Wizard is submitted
const MOCK_BUILD_RESPONSE = {
    score: 9.2,
    summary: "A perfectly balanced 1080p gaming build capable of running modern titles at high settings.",
    totalPrice: 63500,
    remainingBudget: 1500,
    purpose: "gaming" as const,
    scoresBreakdown: {
        performance_match: 3,
        value_score: 3,
        build_balance: 2,
        future_proofing: 1,
        community_trust: 1
    },
    components: [
        { id: 1, name: "AMD Ryzen 5 7600", component_type: "cpu", price_bdt: 23000, vendor_name: "StarTech", vendor_url: "#", justification: "Gives you 6 cores on a future-proof AM5 socket." },
        { id: 2, name: "NVIDIA RTX 4060 8GB", component_type: "gpu", price_bdt: 38000, vendor_name: "Ryans", vendor_url: "#", justification: "Handles modern games at high settings with DLSS 3." },
        { id: 3, name: "MSI PRO B650M-P", component_type: "motherboard", price_bdt: 14500, vendor_name: "TechLand", vendor_url: "#", justification: "Solid VRMs for this budget level." },
        { id: 4, name: "Corsair Vengeance 16GB DDR5", component_type: "ram", price_bdt: 6500, vendor_name: "StarTech", vendor_url: "#" },
        { id: 5, name: "Samsung 980 500GB NVMe", component_type: "storage", price_bdt: 4500, vendor_name: "GlobalBrand", vendor_url: "#" },
        { id: 6, name: "Corsair CV650 650W Bronze", component_type: "psu", price_bdt: 5500, vendor_name: "Ryans", vendor_url: "#" },
        { id: 7, name: "Montech X3 Mesh", component_type: "case", price_bdt: 4500, vendor_name: "PC House", vendor_url: "#" }
    ] as ComponentData[],
    tradeOffs: "Opted for 16GB of RAM instead of 32GB to allocate more budget towards the RTX 4060 GPU to maximize gaming performance.",
    upgradePath: "Add another identical 16GB DDR5 stick when your budget allows."
};

export default function BuildPage() {
    const [buildStatus, setBuildStatus] = useState<"idle" | "generating" | "complete">("idle");
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [componentToSwap, setComponentToSwap] = useState<ComponentData | null>(null);
    const [animationTriggerId, setAnimationTriggerId] = useState<number>(0);

    const handleGenerate = (req: BuildRequest) => {
        console.log("Submitting Request:", req);
        setBuildStatus("generating");

        // Mock API Delay
        setTimeout(() => {
            setBuildStatus("complete");
        }, 7000);
    };

    const handleSwapClick = (c: ComponentData) => {
        setComponentToSwap(c);
        setIsSwapModalOpen(true);
    };

    const handleConfirmSwap = (newComponent: ComponentData) => {
        setIsSwapModalOpen(false);
        setAnimationTriggerId(Date.now());
    };

    return (
        <main className="min-h-screen bg-black text-white relative flex flex-col items-center">
            <div className="fixed inset-0 z-0">
                <SplineBackground />
            </div>

            <div className="w-full max-w-7xl px-6 md:px-12 z-10 relative pt-24 pb-20">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Build Your{" "}
                        <span className="text-gradient-primary">Dream PC</span>
                    </h1>
                    <p className="text-neutral-400">
                        Define your budget and needs. AI will handle the rest.
                    </p>
                </motion.div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 items-start">

                    {/* Input Section (Left Side) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card-glow p-8 space-y-8"
                    >
                        <WizardWrapper onGenerate={handleGenerate} isGenerating={buildStatus === "generating"} />
                    </motion.div>

                    {/* Dynamic Right Panel */}
                    <motion.div
                        className="relative min-h-[500px] h-full"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <AnimatePresence mode="wait">

                            {buildStatus === "idle" && (
                                <motion.div
                                    key="idle"
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 border border-neutral-800 border-dashed rounded-2xl bg-neutral-900/20"
                                >
                                    <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-6 text-neutral-600">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-neutral-300">Ready to Architect</h3>
                                    <p className="text-neutral-500 mt-2 max-w-sm">
                                        Configure your preferences on the left to generate a tailored PC build list instantly.
                                    </p>
                                </motion.div>
                            )}

                            {buildStatus === "generating" && (
                                <motion.div
                                    key="generating"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0"
                                >
                                    <RightPanelLoader />
                                </motion.div>
                            )}

                            {buildStatus === "complete" && (
                                <motion.div
                                    key="complete"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-card flex flex-col"
                                >
                                    <ResultsHeader
                                        score={MOCK_BUILD_RESPONSE.score}
                                        summary={MOCK_BUILD_RESPONSE.summary}
                                        totalPrice={MOCK_BUILD_RESPONSE.totalPrice}
                                        remainingBudget={MOCK_BUILD_RESPONSE.remainingBudget}
                                        purpose={MOCK_BUILD_RESPONSE.purpose}
                                        scoresBreakdown={MOCK_BUILD_RESPONSE.scoresBreakdown}
                                    />

                                    <ComponentList
                                        components={MOCK_BUILD_RESPONSE.components}
                                        onSwapClick={handleSwapClick}
                                    />

                                    <BuildFooter
                                        tradeOffs={MOCK_BUILD_RESPONSE.tradeOffs}
                                        upgradePath={MOCK_BUILD_RESPONSE.upgradePath}
                                        onSave={() => alert("Saving build...")}
                                        onShare={() => alert("Sharing link...")}
                                        onDownloadPDF={() => alert("Downloading PDF...")}
                                    />
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            <SwapModal
                isOpen={isSwapModalOpen}
                onClose={() => setIsSwapModalOpen(false)}
                currentComponent={componentToSwap}
                onConfirmSwap={handleConfirmSwap}
            />
            <TokenSpendAnimation amount={5} triggerId={animationTriggerId} />

        </main>
    );
}
