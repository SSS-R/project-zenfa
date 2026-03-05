"use client";

import React, { useState } from "react";
import { WizardWrapper } from "@/components/build/WizardWrapper";
import { ResultsHeader } from "@/components/build/ResultsHeader";
import { ComponentList } from "@/components/build/ComponentList";
import { BuildFooter } from "@/components/build/BuildFooter";
import { SwapModal } from "@/components/build/SwapModal";
import { TokenSpendAnimation } from "@/components/ui/TokenSpendAnimation";

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
    const [hasGenerated, setHasGenerated] = useState(false);
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [componentToSwap, setComponentToSwap] = useState<ComponentData | null>(null);

    // Animation Triggers
    const [animationTriggerId, setAnimationTriggerId] = useState<number>(0);

    const handleBuildComplete = () => {
        setHasGenerated(true);
    };

    const handleSwapClick = (c: ComponentData) => {
        setComponentToSwap(c);
        setIsSwapModalOpen(true);
    };

    const handleConfirmSwap = (newComponent: ComponentData) => {
        console.log("Swapping to:", newComponent);
        // In real app: Update the state list, recalculate totals
        setIsSwapModalOpen(false);

        // Trigger Token Spend Animation
        setAnimationTriggerId(Date.now());
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center p-4 sm:p-8">

            {/* Background decorations */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

            {/* Main Container */}
            <div className="w-full max-w-4xl z-10 relative pt-10 pb-20">

                {!hasGenerated ? (
                    // Renders Multi-Step Form (which internally handles Loader)
                    <WizardWrapper onComplete={handleBuildComplete} />
                ) : (
                    // Renders Final Results Display
                    <div className="space-y-10">
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
                    </div>
                )}

            </div>

            {/* Modals & Overlays */}
            <SwapModal
                isOpen={isSwapModalOpen}
                onClose={() => setIsSwapModalOpen(false)}
                currentComponent={componentToSwap}
                onConfirmSwap={handleConfirmSwap}
            />

            <TokenSpendAnimation amount={5} triggerId={animationTriggerId} />

        </div>
    );
}
