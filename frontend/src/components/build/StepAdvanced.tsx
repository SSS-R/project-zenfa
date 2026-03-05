"use client";

import React from "react";
import { BuildPreferences } from "@/lib/schemas";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Monitor, Wifi, Box, Minimize, Maximize } from "lucide-react";

interface StepAdvancedProps {
    preferences: Partial<BuildPreferences>;
    setPreferences: React.Dispatch<React.SetStateAction<Partial<BuildPreferences>>>;
}

export function StepAdvanced({ preferences, setPreferences }: StepAdvancedProps) {
    const updatePref = (key: keyof BuildPreferences, value: any) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">
                    The Vibe & Details
                </h2>
                <p className="text-muted-foreground">
                    Tell us about any specific parts or styles you prefer.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Core preferences column */}
                <div className="space-y-6">

                    {/* CPU Preference */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">CPU Preference</Label>
                        <div className="flex bg-secondary/50 p-1 rounded-lg">
                            {["Intel", "AMD", "None"].map((brand) => {
                                const isSelected = brand === "None" ? !preferences.prefer_cpu_brand : preferences.prefer_cpu_brand === brand;
                                return (
                                    <button
                                        key={brand}
                                        className={`flex-1 py-1.5 text-sm rounded-md transition-all ${isSelected ? 'bg-background shadow font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => updatePref("prefer_cpu_brand", brand === "None" ? undefined : brand)}
                                    >
                                        {brand}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* GPU Preference */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">GPU Preference</Label>
                        <div className="flex bg-secondary/50 p-1 rounded-lg">
                            {["NVIDIA", "AMD", "Intel", "None"].map((brand) => {
                                const isSelected = brand === "None" ? !preferences.prefer_gpu_brand : preferences.prefer_gpu_brand === brand;
                                return (
                                    <button
                                        key={brand}
                                        className={`flex-1 py-1.5 text-sm rounded-md transition-all ${isSelected ? 'bg-background shadow font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => updatePref("prefer_gpu_brand", brand === "None" ? undefined : brand)}
                                    >
                                        {brand}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Storage Min */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Minimum Storage</Label>
                        <div className="flex bg-secondary/50 p-1 rounded-lg">
                            {[{ l: '256GB', v: 256 }, { l: '512GB', v: 512 }, { l: '1TB', v: 1000 }, { l: '2TB', v: 2000 }].map((s) => {
                                const isSelected = preferences.min_storage_gb === s.v || (!preferences.min_storage_gb && s.v === 512);
                                return (
                                    <button
                                        key={s.v}
                                        className={`flex-1 py-1.5 text-sm rounded-md transition-all ${isSelected ? 'bg-background shadow font-medium text-foreground ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => updatePref("min_storage_gb", s.v)}
                                    >
                                        {s.l}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Visual & Extra Column */}
                <div className="space-y-6">

                    {/* Form Factor */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Form Factor (Size)</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: "ATX", label: "Standard", icon: Maximize },
                                { id: "mATX", label: "Compact", icon: Box },
                                { id: "ITX", label: "Tiny", icon: Minimize },
                            ].map((ff) => {
                                const Icon = ff.icon;
                                const isSelected = preferences.form_factor === ff.id || (!preferences.form_factor && ff.id === "ATX");
                                return (
                                    <button
                                        key={ff.id}
                                        onClick={() => updatePref("form_factor", ff.id)}
                                        className={`
                      flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                      ${isSelected
                                                ? "border-primary bg-primary/10 text-primary shadow-sm"
                                                : "border-border/50 bg-card hover:bg-secondary/50 text-muted-foreground"
                                            }
                    `}
                                    >
                                        <Icon className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-semibold">{ff.label}</span>
                                        <span className="text-[10px] opacity-70">{ff.id}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* RGB Priority */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">RGB Lighting</Label>
                        <div className="flex bg-secondary/50 p-1 rounded-lg">
                            {[{ l: 'Heavy RGB', v: 'high' }, { l: 'Some', v: 'medium' }, { l: 'None / Stealth', v: 'low' }].map((r) => {
                                const isSelected = preferences.rgb_priority === r.v || (!preferences.rgb_priority && r.v === 'medium');
                                return (
                                    <button
                                        key={r.v}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${isSelected ? 'bg-background shadow text-foreground ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => updatePref("rgb_priority", r.v)}
                                    >
                                        {r.l}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/60 hover:bg-card transition-colors">
                            <div className="flex items-center space-x-3">
                                <Monitor className="text-muted-foreground w-5 h-5" />
                                <Label htmlFor="include_monitor" className="cursor-pointer font-medium">Include Monitor in Budget</Label>
                            </div>
                            <Switch
                                id="include_monitor"
                                checked={preferences.include_monitor || false}
                                onCheckedChange={(c: boolean) => updatePref("include_monitor", c)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/60 hover:bg-card transition-colors">
                            <div className="flex items-center space-x-3">
                                <Wifi className="text-muted-foreground w-5 h-5" />
                                <Label htmlFor="prefer_wifi" className="cursor-pointer font-medium">Motherboard needs Wi-Fi</Label>
                            </div>
                            <Switch
                                id="prefer_wifi"
                                checked={preferences.prefer_wifi || false}
                                onCheckedChange={(c: boolean) => updatePref("prefer_wifi", c)}
                            />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
