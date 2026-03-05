"use client";

import React, { useState } from "react";
import { BuildRequest, BuildPreferences } from "@/lib/schemas";
import { StepBasics } from "@/components/build/StepBasics";
import { StepAdvanced } from "@/components/build/StepAdvanced";
import { EvaluationLoader } from "./EvaluationLoader";
import { Button } from "@/components/ui/button";

interface WizardWrapperProps {
    onComplete: () => void;
}

export function WizardWrapper({ onComplete }: WizardWrapperProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [buildData, setBuildData] = useState<Partial<BuildRequest>>({
        budget_min: 50000,
        budget_max: 70000,
        purpose: "gaming", // default
    });

    const [preferences, setPreferences] = useState<Partial<BuildPreferences>>({
        rgb_priority: "medium",
        include_monitor: false,
        prefer_wifi: false,
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleNextStep = () => setStep(2);
    const handlePrevStep = () => setStep(1);

    const handleGenerateBuild = async () => {
        // Combine data
        const finalRequest: BuildRequest = {
            budget_min: buildData.budget_min as number,
            budget_max: buildData.budget_max as number,
            purpose: buildData.purpose as any,
            preferences: preferences as BuildPreferences,
        };

        console.log("Submitting to Next.js API:", finalRequest);
        setIsLoading(true);

        // Simulate API call delay for UI testing
        setTimeout(() => {
            setIsLoading(false);
            onComplete();
        }, 8000);
    };

    if (isLoading) {
        return <EvaluationLoader />;
    }

    return (
        <div className="w-full max-w-3xl mx-auto bg-card rounded-xl border border-border/50 shadow-2xl overflow-hidden backdrop-blur-sm relative z-10">
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-secondary">
                <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: step === 1 ? "50%" : "100%" }}
                />
            </div>

            <div className="p-6 sm:p-10">
                {step === 1 && (
                    <StepBasics buildData={buildData} setBuildData={setBuildData} />
                )}
                {step === 2 && (
                    <StepAdvanced preferences={preferences} setPreferences={setPreferences} />
                )}

                {/* Footer Actions */}
                <div className="mt-10 flex items-center justify-between pt-6 border-t border-border/50">
                    {step === 2 ? (
                        <Button variant="ghost" onClick={handlePrevStep}>
                            ← Back to Basics
                        </Button>
                    ) : (
                        <div /> // Placeholder for flex spanning
                    )}

                    {step === 1 ? (
                        <Button size="lg" onClick={handleNextStep}>
                            Next: The Vibe →
                        </Button>
                    ) : (
                        <Button size="lg" onClick={handleGenerateBuild} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
                            Generate My PC ⚡
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
