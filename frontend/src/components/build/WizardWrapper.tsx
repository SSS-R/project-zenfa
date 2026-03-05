"use client";

import React, { useState } from "react";
import { BuildRequest, BuildPreferences } from "@/lib/schemas";
import { ChevronDown, Monitor, Wifi } from "lucide-react";

interface WizardWrapperProps {
    onGenerate: (req: BuildRequest) => void;
    isGenerating: boolean;
}

export function WizardWrapper({ onGenerate, isGenerating }: WizardWrapperProps) {
    const [budget, setBudget] = useState(80000);
    const [useCase, setUseCase] = useState<"gaming" | "editing" | "office" | "general">("gaming");

    // Advanced Preferences State
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [cpuBrand, setCpuBrand] = useState<"Intel" | "AMD" | null>(null);
    const [gpuBrand, setGpuBrand] = useState<"NVIDIA" | "AMD" | "Intel" | null>(null);
    const [formFactor, setFormFactor] = useState<"ATX" | "mATX" | "ITX">("ATX");
    const [rgbPriority, setRgbPriority] = useState<"high" | "medium" | "low">("medium");
    const [storageGb, setStorageGb] = useState<number>(1000);
    const [includeMonitor, setIncludeMonitor] = useState(false);
    const [preferWifi, setPreferWifi] = useState(true);

    const handleGenerate = () => {
        const payload: BuildRequest = {
            budget_min: Math.max(15000, budget - 15000), // Approximate range
            budget_max: budget + 10000,
            purpose: useCase,
            preferences: {
                prefer_cpu_brand: cpuBrand || undefined,
                prefer_gpu_brand: gpuBrand || undefined,
                form_factor: formFactor,
                rgb_priority: rgbPriority,
                min_storage_gb: storageGb,
                include_monitor: includeMonitor,
                prefer_wifi: preferWifi
            }
        };
        onGenerate(payload);
    };

    return (
        <div className="space-y-8 w-full animate-in fade-in duration-500">
            {/* 1. Budget Section */}
            <div>
                <div className="flex justify-between mb-4">
                    <label className="font-semibold text-lg text-white">Budget</label>
                    <span className="text-[#4f9e97] font-bold text-xl">৳ {budget.toLocaleString("en-IN")}</span>
                </div>

                <div className="relative h-2 bg-neutral-800 rounded-full">
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#4f9e97] to-[#6ee1c9] rounded-full pointer-events-none"
                        style={{ width: `${(budget / 500000) * 100}%` }}
                    />
                    <input
                        type="range"
                        min="30000"
                        max="500000"
                        step="5000"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="absolute w-full h-full opacity-0 cursor-pointer inset-0"
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-neutral-500 font-mono">
                    <span>৳30k</span>
                    <span>৳500k+</span>
                </div>
            </div>

            {/* 2. Primary Use Section */}
            <div>
                <label className="font-semibold text-lg block mb-4 text-white">What are you trying to run?</label>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { id: "gaming", label: "Gaming (AAA/Esports)" },
                        { id: "editing", label: "Editing (Video/3D)" },
                        { id: "office", label: "Office Work" },
                        { id: "general", label: "General Use" },
                    ].map((type) => {
                        const isSelected = useCase === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setUseCase(type.id as any)}
                                className={`p-4 rounded-xl border transition-all text-sm sm:text-base ${isSelected
                                        ? "border-[#4f9e97] bg-[#4f9e97]/10 text-white shadow-[inset_4px_0_0_0_#4f9e97]"
                                        : "border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-600"
                                    }`}
                            >
                                <span className="font-medium">{type.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. Advanced Preferences (Collapsible) */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-black/20">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between p-4 text-neutral-400 hover:text-white transition-colors"
                >
                    <span className="font-medium text-sm">Advanced Preferences</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                </button>

                {showAdvanced && (
                    <div className="p-4 pt-0 space-y-6 border-t border-neutral-800/50 bg-neutral-900/30">
                        {/* CPU Brand */}
                        <div>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 block">CPU Brand</label>
                            <div className="flex gap-2 p-1 bg-black/50 rounded-lg border border-neutral-800">
                                {["Intel", "AMD", null].map((brand) => (
                                    <button
                                        key={brand || "any"}
                                        onClick={() => setCpuBrand(brand as any)}
                                        className={`flex-1 py-2 text-xs rounded-md transition-colors ${cpuBrand === brand ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-neutral-200"}`}
                                    >
                                        {brand || "No Pref"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* GPU Brand */}
                        <div>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 block">GPU Brand</label>
                            <div className="flex gap-2 p-1 bg-black/50 rounded-lg border border-neutral-800">
                                {["NVIDIA", "AMD", "Intel", null].map((brand) => (
                                    <button
                                        key={brand || "any"}
                                        onClick={() => setGpuBrand(brand as any)}
                                        className={`flex-1 py-2 text-xs rounded-md transition-colors ${gpuBrand === brand ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-neutral-200"}`}
                                    >
                                        {brand || "No Pref"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Form Factor & Storage Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 block">Form Factor</label>
                                <select
                                    value={formFactor}
                                    onChange={(e) => setFormFactor(e.target.value as any)}
                                    className="w-full bg-black/50 border border-neutral-700 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-[#4f9e97]"
                                >
                                    <option value="ATX">Standard (ATX)</option>
                                    <option value="mATX">Compact (mATX)</option>
                                    <option value="ITX">Tiny (ITX)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 block">Min Storage</label>
                                <select
                                    value={storageGb}
                                    onChange={(e) => setStorageGb(Number(e.target.value))}
                                    className="w-full bg-black/50 border border-neutral-700 rounded-lg p-2.5 text-sm text-neutral-300 focus:outline-none focus:border-[#4f9e97]"
                                >
                                    <option value={512}>512 GB</option>
                                    <option value={1000}>1 TB</option>
                                    <option value={2000}>2 TB</option>
                                    <option value={4000}>4 TB</option>
                                </select>
                            </div>
                        </div>

                        {/* RGB Lighting */}
                        <div>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 block">RGB Lighting</label>
                            <div className="flex gap-2 p-1 bg-black/50 rounded-lg border border-neutral-800">
                                {[{ id: "high", label: "Heavy RGB" }, { id: "medium", label: "Some" }, { id: "low", label: "None" }].map((rgb) => (
                                    <button
                                        key={rgb.id}
                                        onClick={() => setRgbPriority(rgb.id as any)}
                                        className={`flex-1 py-2 text-xs rounded-md transition-colors ${rgbPriority === rgb.id ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-neutral-200"}`}
                                    >
                                        {rgb.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3 pt-2">
                            <label className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-black/40 cursor-pointer hover:border-neutral-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Monitor className="w-4 h-4 text-neutral-400" />
                                    <span className="text-sm font-medium text-neutral-300">Include Monitor</span>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${includeMonitor ? 'bg-[#4f9e97]' : 'bg-neutral-800'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${includeMonitor ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={includeMonitor} onChange={(e) => setIncludeMonitor(e.target.checked)} />
                            </label>

                            <label className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-black/40 cursor-pointer hover:border-neutral-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Wifi className="w-4 h-4 text-neutral-400" />
                                    <span className="text-sm font-medium text-neutral-300">Must have Wi-Fi</span>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${preferWifi ? 'bg-[#4f9e97]' : 'bg-neutral-800'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${preferWifi ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={preferWifi} onChange={(e) => setPreferWifi(e.target.checked)} />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-[#4f9e97] to-[#6ee1c9] hover:from-[#448b84] hover:to-[#5fc4ae] text-neutral-950 font-bold py-4 rounded-xl text-lg relative overflow-hidden transition-all shadow-[0_0_20px_rgba(79,158,151,0.3)] hover:shadow-[0_0_25px_rgba(79,158,151,0.5)] active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                        <span>Analyzing Prices...</span>
                    </div>
                ) : (
                    <span>Generate Build</span>
                )}
            </button>
        </div>
    );
}
