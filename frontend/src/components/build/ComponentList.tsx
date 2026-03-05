"use client";

import React from "react";

// Mock interface based on Engine Response
interface ComponentData {
    id: number;
    name: string;
    component_type: "cpu" | "gpu" | "motherboard" | "ram" | "storage" | "psu" | "case" | "cooler";
    price_bdt: number;
    vendor_name: string;
    vendor_url: string;
    justification?: string;
}

interface ComponentListProps {
    components: ComponentData[];
    onSwapClick: (component: ComponentData) => void;
}

const TYPE_BADGES: Record<string, string> = {
    cpu: "CP",
    gpu: "GP",
    motherboard: "MB",
    ram: "RM",
    storage: "ST",
    psu: "PS",
    case: "CS",
    cooler: "CL",
};

export function ComponentList({ components, onSwapClick }: ComponentListProps) {
    const formatBDT = (num: number) => `৳${num.toLocaleString("en-IN")}`;

    const renderCard = (c: ComponentData) => {
        const badge = TYPE_BADGES[c.component_type] || "XX";

        return (
            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-neutral-800/50 hover:bg-white/5 transition-colors group gap-4">
                {/* Left Side: Badge + Info */}
                <div className="flex items-start sm:items-center gap-4">
                    {/* Badge */}
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-sm text-neutral-400 group-hover:text-white transition-colors">
                        {badge}
                    </div>

                    {/* Text block */}
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-neutral-200">{c.name}</h4>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-600 font-bold bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
                                {c.component_type}
                            </span>
                        </div>
                        {c.justification && (
                            <p className="text-sm text-neutral-500 line-clamp-1 mt-0.5">
                                {c.justification}
                            </p>
                        )}
                        {/* Mobile Price Display */}
                        <div className="mt-1 sm:hidden flex items-center gap-2 text-sm">
                            <span className="font-mono font-bold text-white">{formatBDT(c.price_bdt)}</span>
                            <span className="text-xs text-neutral-500">via <span className="text-neutral-400">{c.vendor_name}</span></span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Price + Actions */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:pl-4">
                    {/* Desktop Price Display */}
                    <div className="hidden sm:block text-right shrink-0">
                        <div className="font-mono font-bold text-white">{formatBDT(c.price_bdt)}</div>
                        <div className="text-xs text-neutral-500">via <span className="text-neutral-400">{c.vendor_name}</span></div>
                    </div>

                    {/* Actions - Visible on hover for desktop, always visible on mobile */}
                    <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity w-full sm:w-auto">
                        <button
                            onClick={() => onSwapClick(c)}
                            className="flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1.5 rounded-full bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700 transition-colors"
                        >
                            Swap
                        </button>
                        <a
                            href={c.vendor_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 sm:flex-none px-4 py-2 sm:px-3 sm:py-1.5 justify-center rounded-full bg-[#4f9e97]/10 text-[#4f9e97] text-xs font-semibold hover:bg-[#4f9e97]/20 transition-colors flex items-center gap-1"
                        >
                            Buy <span className="text-[10px] leading-none">→</span>
                        </a>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex-1 overflow-y-auto animate-in fade-in duration-700">
            {components.map((c) => renderCard(c))}
        </div>
    );
}
