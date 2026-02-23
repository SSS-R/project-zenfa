"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center pt-24 pb-12 px-4">
            <div className="relative w-full max-w-md rounded-[1.75rem] border border-neutral-800/50 p-1 md:p-2 group transition-transform duration-300 hover:-translate-y-1">
                <GlowingEffect
                    blur={0}
                    borderWidth={3}
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />
                <div className="relative flex flex-col w-full h-full bg-neutral-950/80 backdrop-blur-xl border border-neutral-800/50 rounded-[1.25rem] p-8 shadow-2xl overflow-hidden z-10 transition-colors group-hover:border-[#4f9e97]/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#4f9e97]/10 blur-3xl rounded-full pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-neutral-400">Sign in to sync your PC builds and manage tokens.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-xl p-3 text-sm text-center">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4f9e97] focus:ring-1 focus:ring-[#4f9e97] transition"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-medium text-neutral-300">Password</label>
                                <Link href="/forgot" className="text-sm text-[#4f9e97] hover:text-[#6ee1c9] transition">Forgot password?</Link>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4f9e97] focus:ring-1 focus:ring-[#4f9e97] transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button disabled={loading} type="submit" className="w-full btn-primary py-3 rounded-xl font-bold flex justify-center mt-6 disabled:opacity-50">
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-800 text-center relative z-10">
                        <p className="text-neutral-400">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-[#4f9e97] font-medium hover:text-[#6ee1c9] transition">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
