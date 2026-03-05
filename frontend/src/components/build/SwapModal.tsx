"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, ArrowRight } from "lucide-react";

// Using the same ComponentData interface from ComponentList
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

// Mock AI Suggestions
export function SwapModal({ isOpen, onClose, currentComponent, onConfirmSwap }: SwapModalProps) {
    const [selectedAlt, setSelectedAlt] = useState<ComponentData | null>(null);

    if (!currentComponent) return null;

    const formatBDT = (num: number) => `৳${num.toLocaleString("en-IN")}`;

    const handleConfirm = () => {
        if (selectedAlt) {
            onConfirmSwap(selectedAlt);
            setSelectedAlt(null); // reset
        }
    };

    const isCrossBrand = () => {
        if (currentComponent.name.includes("Ryzen") && selectedAlt?.name.includes("Intel")) return true;
        if (currentComponent.name.includes("Intel") && selectedAlt?.name.includes("Ryzen")) return true;
        return false;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl bg-card border-border/50">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        Swap Component: {currentComponent.component_type.toUpperCase()}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 relative">

                    {/* Left Side: Current Component */}
                    <div className="space-y-3">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Currently Selected</div>
                        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col justify-between h-32">
                            <div>
                                <h3 className="font-bold text-foreground">{currentComponent.name}</h3>
                                <p className="text-sm text-muted-foreground">{currentComponent.vendor_name}</p>
                            </div>
                            <div className="text-xl font-mono font-bold">{formatBDT(currentComponent.price_bdt)}</div>
                        </div>
                    </div>

                    {/* Arrow Separator (Hidden on mobile) */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 mt-3 w-8 h-8 rounded-full bg-secondary items-center justify-center border border-border z-10 text-muted-foreground">
                        <ArrowRight className="w-4 h-4" />
                    </div>

                    {/* Right Side: Alternative Selected OR Search */}
                    <div className="space-y-3">
                        <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Replacement</div>

                        {selectedAlt ? (
                            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-between h-32 relative">
                                <button onClick={() => setSelectedAlt(null)} className="absolute top-2 right-2 text-xs text-muted-foreground hover:text-foreground">Change</button>
                                <div>
                                    <h3 className="font-bold text-foreground">{selectedAlt.name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedAlt.vendor_name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-mono font-bold">{formatBDT(selectedAlt.price_bdt)}</span>
                                    {/* Diff pill */}
                                    {selectedAlt.price_bdt !== currentComponent.price_bdt && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${selectedAlt.price_bdt > currentComponent.price_bdt ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {selectedAlt.price_bdt > currentComponent.price_bdt ? '+' : ''}{formatBDT(selectedAlt.price_bdt - currentComponent.price_bdt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl border border-dashed border-border/50 bg-secondary/20 flex flex-col justify-center items-center h-32 text-muted-foreground hover:bg-secondary/40 hover:border-border transition-colors cursor-pointer">
                                <Search className="w-5 h-5 mb-2 opacity-50" />
                                <span className="text-sm font-medium">Select an alternative below</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Domino Effect Warning */}
                {isCrossBrand() && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mt-2 flex items-start gap-3 text-orange-400">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">
                            <strong>Note:</strong> Swapping to a different CPU brand will automatically adjust your Motherboard to match the new socket type.
                        </p>
                    </div>
                )}

                {/* AI Suggestions List */}
                {!selectedAlt && (
                    <div className="mt-6 space-y-3 border-t border-border/50 pt-4">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Suggestions</div>
                        <div className="space-y-2">
                            {/* In a real app, this would be fetched from the backend based on currentComponent.component_type */}
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-colors cursor-pointer" onClick={() => setSelectedAlt({ id: 901, name: "AMD Ryzen 7 7800X3D", component_type: currentComponent.component_type, price_bdt: 45000, vendor_name: "Ryans", vendor_url: "#" })}>
                                <div>
                                    <div className="font-semibold text-sm">AMD Alternative</div>
                                    <div className="text-xs text-muted-foreground">{formatBDT(45000)}</div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8">Select</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        disabled={!selectedAlt}
                        onClick={handleConfirm}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold relative overflow-hidden group"
                    >
                        Confirm Swap
                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
