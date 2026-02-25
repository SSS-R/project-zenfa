"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import SplineBackground from "@/components/SplineBackground";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SharedBuildPage({ params }: { params: { slug: string } }) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [buildData, setBuildData] = useState<any>(null);

    useEffect(() => {
        // In a real app, we fetch the saved build info using the slug mapping here:
        // fetch(`/api/builds/${params.slug}`).then(r => r.json()).then(setBuildData).finally(() => setLoading(false))

        // For standard phase demo:
        setTimeout(() => {
            setBuildData({
                id: params.slug,
                budget: 85000,
                purpose: "Gaming",
                parts: [
                    { id: 1, type: "CPU", name: "AMD Ryzen 5 5600X", price: 17500 },
                    { id: 2, type: "GPU", name: "Gigabyte RTX 3060 12GB", price: 38000 },
                    { id: 3, type: "MB", name: "MSI B550M PRO-VDH", price: 12000 },
                    { id: 4, type: "RAM", name: "Corsair Vengeance 16GB (8x2) 3200MHz", price: 5500 },
                    { id: 5, type: "SSD", name: "Samsung 980 500GB NVMe", price: 6000 },
                    { id: 6, type: "PSU", name: "Corsair CV650 80+ Bronze", price: 6000 },
                ]
            });
            setLoading(false);
        }, 1000);
    }, [params.slug]);

    const exportPDF = async () => {
        const element = document.getElementById("shared-build-container");
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: "#000000",
                scale: 2
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`PCLagbe_Shared_${params.slug}.pdf`);
        } catch (e) {
            console.error("PDF generation failed:", e);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex justify-center items-center text-[#4f9e97]">
                <div className="w-8 h-8 border-4 border-[#4f9e97]/20 border-t-[#4f9e97] rounded-full animate-spin"></div>
            </div>
        );
    }

    // Referral injected CTA Link
    const referralCode = (session?.user as any)?.referral_code;
    const ctaLink = referralCode ? `/register?ref=${referralCode}` : `/`;

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            <SplineBackground />

            <div className="pt-24 px-6 md:px-12 max-w-4xl mx-auto relative z-10" id="shared-build-container">
                <div className="text-center mb-12">
                    <div className="inline-block bg-[#4f9e97]/20 text-[#4f9e97] px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4 border border-[#4f9e97]/30">
                        Shared Build
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {buildData.purpose} <span className="text-gradient-primary">Beast</span>
                    </h1>
                    <p className="text-neutral-400">
                        Total Value: <strong className="text-white text-xl">৳ {buildData.budget.toLocaleString()}</strong>
                    </p>
                </div>

                <div className="glass-card p-6 md:p-10 mb-8 max-w-3xl mx-auto border border-neutral-800/60 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-neutral-800">
                        <h2 className="text-xl font-bold">Components</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={exportPDF}
                                className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors border border-white/5"
                                title="Download PDF"
                            >
                                <Download size={20} />
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert("Link copied!");
                                }}
                                className="p-2 hover:bg-[#4f9e97]/20 bg-[#4f9e97]/10 text-[#4f9e97] rounded-lg transition-colors border border-[#4f9e97]/30"
                                title="Copy Link"
                            >
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {buildData.parts.map((part: any) => (
                            <div key={part.id} className="flex items-center p-3 rounded-lg bg-black/40 border border-white/5 hover:bg-white/5 transition-colors group">
                                <div className="w-10 h-10 rounded-md bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500 mr-4 group-hover:bg-[#4f9e97]/20 group-hover:text-[#4f9e97] transition-colors">
                                    {part.type.substring(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-neutral-500 mb-0.5">{part.type}</div>
                                    <div className="font-medium text-sm text-neutral-200">
                                        {part.name}
                                    </div>
                                </div>
                                <div className="font-mono text-sm text-[#4f9e97] font-bold">
                                    ৳{part.price.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Gamification / Referral CTA */}
                <div className="text-center pb-24" data-html2canvas-ignore>
                    <p className="text-neutral-400 mb-4">Want to build something similar?</p>
                    <Link href={ctaLink} className="btn-primary py-4 px-8 text-lg inline-block hover:scale-105 transition-transform duration-300">
                        Create Your Own PC
                    </Link>
                </div>
            </div>
        </main>
    );
}
