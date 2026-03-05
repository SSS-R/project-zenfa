"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, AlertTriangle, ArrowRight, X, Zap } from "lucide-react";

// Using the same ComponentData interface
interface ComponentData {
    id: number;
    name: string;
    component_type: "cpu" | "gpu" | "motherboard" | "ram" | "storage" | "psu" | "case" | "cooler";
    price_bdt: number;
    vendor_name: string;
    vendor_url: string;
}

interface SwapModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentComponent: ComponentData | null;
    onConfirmSwap: (newComponent: ComponentData) => void;
}

export function SwapModal({ isOpen, onClose, currentComponent, onConfirmSwap }: SwapModalProps) {
    const [selectedAlt, setSelectedAlt] = useState<ComponentData | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    if (!currentComponent) return null;

    const formatBDT = (num: number) => `৳${num.toLocaleString("en-IN")}`;

    const handleConfirm = () => {
        if (selectedAlt) {
            onConfirmSwap(selectedAlt);
            setSelectedAlt(null); // reset
            setSearchQuery("");
        }
    };

    const isCrossBrand = () => {
        if (currentComponent.name.includes("Ryzen") && selectedAlt?.name.includes("Intel")) return true;
        if (currentComponent.name.includes("Intel") && selectedAlt?.name.includes("Ryzen")) return true;
        return false;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                setSelectedAlt(null);
                setSearchQuery("");
            }
        }}>
            <DialogContent className="max-w-3xl glass-card border-neutral-800 p-0 overflow-hidden bg-neutral-950/90 text-white shadow-2xl">

                <DialogHeader className="p-6 pb-4 border-b border-neutral-800/50">
                    <DialogTitle className="text-xl font-bold flex items-center justify-between">
                        <span>Swap Component: <span className="text-[#4f9e97]">{currentComponent.component_type.toUpperCase()}</span></span>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search alternatives (e.g., 'RTX 4070' or 'Ryzen 7')..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/50 border border-neutral-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#4f9e97] text-white placeholder:text-neutral-600 transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {/* Left Side: Current Component */}
                        <div className="space-y-3">
                            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Currently Selected</div>
                            <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 flex flex-col justify-between h-32 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                                <div>
                                    <h3 className="font-bold text-white line-clamp-1">{currentComponent.name}</h3>
                                    <p className="text-xs text-neutral-400 mt-1">via {currentComponent.vendor_name}</p>
                                </div>
                                <div className="text-xl font-mono font-bold text-neutral-300">{formatBDT(currentComponent.price_bdt)}</div>
                            </div>
                        </div>

                        {/* Arrow Separator (Desktop only) */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 mt-3 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 items-center justify-center z-10 text-[#4f9e97]">
                            <ArrowRight className="w-4 h-4" />
                        </div>

                        {/* Right Side: Alternative Selected */}
                        <div className="space-y-3">
                            <div className="text-xs font-bold text-[#4f9e97] uppercase tracking-wider">Replacement</div>

                            {selectedAlt ? (
                                <div className="p-4 rounded-xl border border-[#4f9e97]/30 bg-[#4f9e97]/10 flex flex-col justify-between h-32 relative">
                                    <button onClick={() => setSelectedAlt(null)} className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="pr-6">
                                        <h3 className="font-bold text-white line-clamp-1">{selectedAlt.name}</h3>
                                        <p className="text-xs text-neutral-400 mt-1">via {selectedAlt.vendor_name}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-mono font-bold text-white">{formatBDT(selectedAlt.price_bdt)}</span>
                                        {/* Diff pill */}
                                        {selectedAlt.price_bdt !== currentComponent.price_bdt && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${selectedAlt.price_bdt > currentComponent.price_bdt ? 'bg-rose-500/20 text-rose-400' : 'bg-[#4f9e97]/20 text-[#4f9e97]'}`}>
                                                {selectedAlt.price_bdt > currentComponent.price_bdt ? '+' : ''}{formatBDT(selectedAlt.price_bdt - currentComponent.price_bdt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl border border-dashed border-neutral-800 bg-black/20 flex flex-col justify-center items-center h-32 text-neutral-500 hover:bg-neutral-900/40 hover:border-neutral-700 transition-colors">
                                    <Search className="w-5 h-5 mb-2 opacity-40" />
                                    <span className="text-xs font-medium">Select an alternative below</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Domino Effect Warning */}
                    {isCrossBrand() && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-orange-400 flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed">
                                Swapping CPU brands requires adjusting your Motherboard. The AI will recalculate the build balance to ensure 100% compatibility.
                            </p>
                        </div>
                    )}

                    {/* AI Suggestions List */}
                    {!selectedAlt && (
                        <div className="space-y-3 pt-2">
                            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">AI Suggestions</div>
                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                                {/* Mock Alternatives */}
                                {[
                                    { id: 901, name: "AMD Ryzen 7 7800X3D", component_type: currentComponent.component_type, price_bdt: 45000, vendor_name: "Ryans", vendor_url: "#" },
                                    { id: 902, name: "Intel Core i5-13600K", component_type: currentComponent.component_type, price_bdt: 38000, vendor_name: "StarTech", vendor_url: "#" }
                                ].map((alt) => (
                                    <div
                                        key={alt.id}
                                        onClick={() => setSelectedAlt(alt as any)}
                                        className="flex items-center justify-between p-3 rounded-lg border border-neutral-800/60 hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <div>
                                            <div className="font-bold text-sm text-neutral-200 group-hover:text-white transition-colors">{alt.name}</div>
                                            <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                                                <span>{formatBDT(alt.price_bdt)}</span>
                                                <span className="w-1 h-1 rounded-full bg-neutral-700" />
                                                <span>{alt.vendor_name}</span>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-bold hover:bg-neutral-700 transition-colors uppercase tracking-wider">
                                            Select
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/30 flex items-center justify-between">
                    <div className="text-xs text-neutral-500 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-neutral-800/50">
                        <Zap className="w-3.5 h-3.5 text-[#4f9e97]" />
                        <span>Swap costs <strong className="text-white">5 Tokens</strong></span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!selectedAlt}
                            onClick={handleConfirm}
                            className="bg-[#4f9e97] hover:bg-[#3d7a75] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(79,158,151,0.3)] disabled:opacity-50 disabled:shadow-none transition-all disabled:cursor-not-allowed"
                        >
                            Confirm Swap
                        </button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
