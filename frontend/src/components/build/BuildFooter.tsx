"use client";

import React from "react";
import { Info, ArrowUpRight, Save, Share2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BuildFooterProps {
    tradeOffs: string;
    upgradePath: string;
    onSave: () => void;
    onShare: () => void;
    onDownloadPDF: () => void;
}

export function BuildFooter({ tradeOffs, upgradePath, onSave, onShare, onDownloadPDF }: BuildFooterProps) {
    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both mt-10">

            {/* AI Reasoning Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5 hover:bg-orange-500/10 transition-colors">
                    <div className="flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-wider mb-2">
                        <Info className="w-4 h-4" /> Trade-offs Made
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tradeOffs}</p>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 hover:bg-emerald-500/10 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm uppercase tracking-wider mb-2">
                        <ArrowUpRight className="w-4 h-4" /> Recommended Upgrade Path
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{upgradePath}</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-card border border-border/50 rounded-xl gap-4">
                <div className="flex w-full sm:w-auto gap-3">
                    <Button variant="outline" className="flex-1 sm:flex-none border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors" onClick={onSave}>
                        <Save className="w-4 h-4 mr-2" /> Save Build
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none" onClick={onDownloadPDF}>
                        <FileDown className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                </div>

                <Button onClick={onShare} className="w-full sm:w-auto bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all">
                    <Share2 className="w-4 h-4 mr-2" /> Share Link 🔗
                </Button>
            </div>

        </div>
    );
}
