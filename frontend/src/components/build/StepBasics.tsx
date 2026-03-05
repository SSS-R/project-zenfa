"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { BuildRequest } from "@/lib/schemas";
import { Label } from "@/components/ui/label";
import { Gamepad2, MonitorPlay, Briefcase, Video } from "lucide-react";

interface StepBasicsProps {
    buildData: Partial<BuildRequest>;
    setBuildData: React.Dispatch<React.SetStateAction<Partial<BuildRequest>>>;
}

const PURPOSES = [
    { id: "gaming", label: "PC Gaming / Esports", icon: Gamepad2, desc: "High FPS, fast response." },
    { id: "editing", label: "Video Editing / 3D", icon: Video, desc: "Premiere, Blender, Maya." },
    { id: "office", label: "Standard Office Work", icon: Briefcase, desc: "Excel, Docs, Browsing." },
    { id: "general", label: "General Use / Media", icon: MonitorPlay, desc: "Netflix, YouTube, Light tasks." },
];

export function StepBasics({ buildData, setBuildData }: StepBasicsProps) {
    // Safe default for slider
    const sliderValue = [buildData.budget_min || 50000, buildData.budget_max || 70000];

    const handleSliderChange = (vals: number[]) => {
        setBuildData((prev) => ({ ...prev, budget_min: vals[0], budget_max: vals[1] }));
    };

    const handlePurposeSelect = (purpose: string) => {
        setBuildData((prev) => ({ ...prev, purpose: purpose as any }));
    };

    // Helper formatter
    const formatBDT = (num: number) => `৳${num.toLocaleString("en-IN")}`;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
                    Let's build your dream PC.
                </h2>
                <p className="text-muted-foreground text-lg">
                    We just need to know how much you want to spend and what you'll use it for.
                </p>
            </div>

            {/* 1. Budget Section */}
            <div className="space-y-6 bg-card/50 p-6 rounded-xl border border-border/40 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                    <Label className="text-xl font-bold">What is your total budget?</Label>
                    <div className="text-2xl font-mono font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-md border border-primary/20">
                        {formatBDT(sliderValue[0])} - {formatBDT(sliderValue[1])}
                    </div>
                </div>

                <div className="pt-4 pb-2 px-2">
                    <Slider
                        value={sliderValue}
                        onValueChange={handleSliderChange}
                        min={15000}
                        max={300000}
                        step={1000}
                        className="cursor-pointer"
                    />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground px-2 font-mono">
                    <span>৳15,000</span>
                    <span>৳300,000+</span>
                </div>
            </div>

            {/* 2. Purpose Section */}
            <div className="space-y-4">
                <Label className="text-xl font-bold block mb-4">What will you primarily run?</Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PURPOSES.map((p) => {
                        const Icon = p.icon;
                        const isSelected = buildData.purpose === p.id;

                        return (
                            <button
                                key={p.id}
                                onClick={() => handlePurposeSelect(p.id)}
                                className={`
                  relative flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all duration-200 overflow-hidden group
                  ${isSelected
                                        ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(79,70,229,0.15)] scale-[1.02]"
                                        : "border-border/50 bg-card hover:border-primary/50 hover:bg-card/80"
                                    }
                `}
                            >
                                {/* Visual Indicator of selection */}
                                {isSelected && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-bl-[100%] transition-opacity" />
                                )}

                                <div className={`p-3 rounded-lg border mb-3 ${isSelected ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-secondary/50 border-border text-muted-foreground group-hover:text-primary group-hover:border-primary/30'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                <div className="font-semibold text-lg text-foreground mb-1">{p.label}</div>
                                <div className="text-sm text-muted-foreground">{p.desc}</div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
