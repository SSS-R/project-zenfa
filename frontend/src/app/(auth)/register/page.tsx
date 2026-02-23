"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Register the user on the FastAPI backend
            const regRes = await fetch("http://127.0.0.1:8001/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    display_name: name
                })
            });

            if (!regRes.ok) {
                const errorData = await regRes.json();
                throw new Error(errorData.detail || "Registration failed");
            }

            // Immediately sign them in
            const signRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (signRes?.error) {
                setError("Account created, but automatic sign in failed. Please log in.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center pt-24 pb-12 px-4">
            <div className="relative w-full max-w-md rounded-[1.75rem] border border-neutral-800/50 p-2 group">
                <GlowingEffect
                    blur={0}
                    borderWidth={3}
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />
                <div className="relative flex flex-col w-full bg-neutral-900 border border-neutral-800 rounded-[1.5rem] p-8 shadow-2xl overflow-hidden z-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#4f9e97]/10 blur-3xl rounded-full pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-neutral-400">Join PC Lagbe to save builds, tweak components, and view AI reasoning.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-xl p-3 text-sm text-center">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4f9e97] focus:ring-1 focus:ring-[#4f9e97] transition"
                                placeholder="Fahim Rahman"
                            />
                        </div>

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
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
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
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-800 text-center relative z-10">
                        <p className="text-neutral-400 bg-[#4f9e97]/5 border border-[#4f9e97]/20 rounded-lg p-3 text-sm mb-4">
                            🎁 Welcome Gift: <span className="font-bold text-[#4f9e97]">10 Free Tokens</span> (1 Full Build) on signup!
                        </p>
                        <p className="text-neutral-500 text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-[#4f9e97] font-medium hover:text-[#6ee1c9] transition">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
