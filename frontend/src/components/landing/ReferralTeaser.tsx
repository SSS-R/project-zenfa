"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Gift, Copy, Share2 } from "lucide-react";

export function ReferralTeaser() {
    return (
        <section className="py-24 bg-black relative z-10 px-6">
            <motion.div
                className="max-w-5xl mx-auto glass-card-glow border border-[#4f9e97]/30 p-8 md:p-12 text-center rounded-3xl relative overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                {/* Decorative elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#4f9e97] rounded-full blur-[100px] opacity-20 pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#6ee1c9] rounded-full blur-[100px] opacity-10 pointer-events-none" />

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-black border-2 border-[#4f9e97]/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(79,158,151,0.3)]">
                        <Gift className="w-8 h-8 text-[#4f9e97]" />
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Earn Free Tokens
                    </h2>
                    <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-8">
                        Every AI generation costs compute power. Help us grow by sharing PC Lagbe with your friends, and earn 10 free build tokens for every signup.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                        <div className="w-full sm:w-auto flex items-center bg-black border border-neutral-700 rounded-lg px-4 py-3 pb-2.5">
                            <span className="text-neutral-500 font-mono text-sm truncate select-none">
                                pclagbe.com/ref/sultan_r99
                            </span>
                            <button className="ml-4 text-[#4f9e97] hover:text-white transition-colors" title="Copy to clipboard">
                                <Copy size={18} />
                            </button>
                        </div>

                        <Link href="/auth/signup">
                            <button className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 py-3">
                                <Share2 size={18} />
                                Get My Link
                            </button>
                        </Link>
                    </div>

                    <p className="text-xs text-neutral-600 mt-6">
                        Tokens are completely free. You get 5 just for creating an account.
                    </p>
                </div>
            </motion.div>
        </section>
    );
}
