import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-24 px-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#4f9e97]/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Token-Based Pricing</h1>
                <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-16">
                    Pay only for what you use. 1 Full PC Build Generation costs <strong className="text-white">10 Tokens</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">

                    {/* Starter Pack */}
                    <div className="glass-card p-8 rounded-2xl flex flex-col border border-neutral-800 hover:border-[#4f9e97]/30 transition-colors">
                        <h3 className="text-2xl font-bold mb-2">Starter Pack</h3>
                        <p className="text-neutral-400 text-sm mb-6">Perfect for standard builders.</p>
                        <div className="text-4xl font-extrabold mb-2 text-white">৳ 50</div>
                        <div className="text-[#4f9e97] font-bold mb-8">30 Tokens (3 Builds)</div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center text-sm text-neutral-300">
                                <svg className="w-5 h-5 text-[#4f9e97] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                3 Full AI Build Generations
                            </li>
                            <li className="flex items-center text-sm text-neutral-300">
                                <svg className="w-5 h-5 text-[#4f9e97] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                3 Free Tweaks Per Session
                            </li>
                            <li className="flex items-center text-sm text-neutral-300">
                                <svg className="w-5 h-5 text-[#4f9e97] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Save Builds to Profile
                            </li>
                        </ul>
                        <button className="w-full py-3 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors border border-neutral-700">Buy Package</button>
                    </div>

                    {/* Pro Pack (Highlighted) */}
                    <div className="glass-card-glow p-8 rounded-2xl flex flex-col border border-[#4f9e97]/50 relative scale-105 shadow-2xl shadow-[#4f9e97]/10">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#4f9e97] text-black text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                            Most Popular
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-white">Pro Pack</h3>
                        <p className="text-neutral-400 text-sm mb-6">For enthusiasts and heavy testing.</p>
                        <div className="text-4xl font-extrabold mb-2 text-white">৳ 100</div>
                        <div className="text-[#4f9e97] font-bold mb-8">70 Tokens (7 Builds)</div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center text-sm text-neutral-300">
                                <svg className="w-5 h-5 text-[#4f9e97] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                7 Full AI Build Generations
                            </li>
                            <li className="flex items-center text-sm text-neutral-300">
                                <svg className="w-5 h-5 text-[#4f9e97] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                15 Free Tweaks Per Session
                            </li>
                            <li className="flex items-center text-sm text-neutral-300">
                                <svg className="w-5 h-5 text-[#4f9e97] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Detailed AI Reasoning Logs
                            </li>
                        </ul>
                        <button className="w-full py-3 rounded-xl font-bold btn-primary text-white shadow-lg shadow-[#4f9e97]/30 border border-[#4f9e97]">Buy Package</button>
                    </div>

                    {/* Enthusiast Pack */}
                    <div className="glass-card p-8 rounded-2xl flex flex-col border border-neutral-800 hover:border-[#4f9e97]/30 transition-colors">
                        <h3 className="text-2xl font-bold mb-2">Enthusiast Pack</h3>
                        <p className="text-neutral-400 text-sm mb-6">The ultimate builder's toolkit.</p>
                        <div className="text-4xl font-extrabold mb-2 text-white">৳ 350</div>
                        <div className="text-purple-400 font-bold mb-8">300 Tokens (30 Builds)</div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center text-sm text-neutral-300">
                                <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                30 Full AI Build Generations
                            </li>
                            <li className="flex items-center text-sm text-white font-medium">
                                <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Unlimited Free Tweaks
                            </li>
                            <li className="flex items-center text-sm text-neutral-300">
                                <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Priority Support Line
                            </li>
                        </ul>
                        <button className="w-full py-3 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors border border-neutral-700">Buy Package</button>
                    </div>

                </div>

                <div className="mt-16 text-neutral-500 text-sm">
                    <p>Payments currently processed manually via bKash/Nagad.</p>
                    <p>Tokens are credited as soon as your TrxID is verified by an admin.</p>
                </div>
            </div>
        </div>
    );
}
