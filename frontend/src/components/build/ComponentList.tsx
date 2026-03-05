"use client";

import React from "react";
import { Cpu, Maximize, HardDrive, Zap, Wind, SquareDashedBottom } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const TYPE_ICONS: Record<string, React.ElementType> = {
    cpu: Cpu,
    gpu: Maximize, // representation for GPU card
    motherboard: SquareDashedBottom,
    ram: HardDrive,
    storage: HardDrive, // representation for NVMe
    psu: Zap,
    case: BoxIcon,
    cooler: Wind,
};

function BoxIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.29 7 12 12 20.71 7" />
            <line x1="12" y1="22" x2="12" y2="12" />
        </svg>
    );
}

export function ComponentList({ components, onSwapClick }: ComponentListProps) {
    const formatBDT = (num: number) => `৳${num.toLocaleString("en-IN")}`;

    const coreTypes = ["cpu", "gpu", "motherboard", "ram"];

    const coreParts = components.filter(c => coreTypes.includes(c.component_type));
    const secondaryParts = components.filter(c => !coreTypes.includes(c.component_type));

    const renderCard = (c: ComponentData, isCore: boolean) => {
        const Icon = TYPE_ICONS[c.component_type] || Cpu;

        if (isCore) {
            return (
                <div key={c.id} className="group relative flex flex-col sm:flex-row items-start sm:items-center p-5 gap-5 bg-card border border-border/50 rounded-xl hover:border-primary/40 transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="p-4 bg-secondary/50 rounded-lg text-primary border border-primary/10 group-hover:bg-primary/10 transition-colors">
                        {React.createElement(Icon as React.ElementType, { className: "w-8 h-8" })}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{c.component_type}</div>
                            <h3 className="text-lg font-bold text-foreground leading-tight">{c.name}</h3>
                        </div>
                        {c.justification && (
                            <p className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-md border-l-2 border-primary/50">
                                "{c.justification}"
                            </p>
                        )}
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground pt-1">
                            <span>via {c.vendor_name}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-border/50">
                        <div className="text-2xl font-mono relativefont-bold text-foreground">{formatBDT(c.price_bdt)}</div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto flex-1 font-semibold" onClick={() => window.open(c.vendor_url, "_blank")}>
                                Buy →
                            </Button>
                            <Button variant="secondary" size="sm" className="w-full sm:w-auto flex-1" onClick={() => onSwapClick(c)}>
                                Swap
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        // Secondary items (Smaller layout)
        return (
            <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 gap-4 bg-card border border-border/30 rounded-lg hover:border-border/80 transition-all">
                <div className="p-2.5 bg-secondary/30 rounded-md text-muted-foreground border border-border/20">
                    {React.createElement(Icon as React.ElementType, { className: "w-5 h-5" })}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{c.component_type}</div>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1">{c.name}</h4>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto mt-3 sm:mt-0 justify-between sm:justify-end">
                    <div className="text-base font-mono font-bold text-foreground">{formatBDT(c.price_bdt)}</div>
                    <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => window.open(c.vendor_url, "_blank")}>Buy</Button>
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs hover:bg-secondary" onClick={() => onSwapClick(c)}>Swap</Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" /> The Core Engine
                </h3>
                <div className="space-y-4">
                    {coreParts.map((c) => renderCard(c, true))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <BoxIcon className="w-4 h-4" /> Foundation & Polish
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {secondaryParts.map((c) => renderCard(c, false))}
                </div>
            </div>

        </div>
    );
}
