'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageName: 'starter' | 'pro' | 'enthusiast';
    priceBdt: number;
    tokensText: string;
}

export function CheckoutModal({ isOpen, onClose, packageName, priceBdt, tokensText }: CheckoutModalProps) {
    const { data: session } = useSession();
    const [trxId, setTrxId] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!trxId.trim()) {
            setStatus('error');
            setErrorMessage('Transaction ID is required.');
            return;
        }

        if (!session?.accessToken) {
            setStatus('error');
            setErrorMessage('You must be logged in to purchase a package.');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            // Note: Use environment variable or relative path in production
            const res = await fetch('/api/b2c/payments/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({
                    package: packageName,
                    gateway: 'manual',
                    gateway_trx_id: trxId.trim()
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Failed to submit transaction.');
            }

            setStatus('success');
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={status !== 'success' ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl shadow-[#4f9e97]/10 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-900/50">
                    <h2 className="text-xl font-bold text-white capitalize">{packageName} Pack</h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white transition-colors p-1 rounded-md hover:bg-neutral-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {status === 'success' ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                                <CheckCircle className="text-green-500 w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Request Submitted!</h3>
                            <p className="text-neutral-400 text-sm mb-6">
                                Your transaction ID (<strong className="text-neutral-200">{trxId}</strong>) has been sent for admin review. Your tokens will be credited as soon as the TrxID is verified.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors border border-neutral-700"
                            >
                                Back to Pricing
                            </button>
                        </div>
                    ) : (
                        <>
                            {!session ? (
                                <div className="text-center py-6">
                                    <AlertCircle className="text-[#4f9e97] w-12 h-12 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">Login Required</h3>
                                    <p className="text-neutral-400 text-sm mb-6">
                                        You need to create an account or sign in before you can purchase token packs.
                                    </p>
                                    <div className="flex gap-4">
                                        <Link
                                            href="/login"
                                            className="flex-1 py-3 rounded-xl font-bold btn-primary text-white border border-[#4f9e97] text-center"
                                        >
                                            Login
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 mb-6 text-center">
                                        <div className="text-sm text-neutral-400 mb-1">Please send exactly</div>
                                        <div className="text-3xl font-bold text-white mb-1">৳{priceBdt}</div>
                                        <div className="text-xs text-[#4f9e97] font-medium uppercase tracking-wider">For {tokensText}</div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <div className="text-sm text-neutral-400 mb-2">
                                                1. Send money via **bKash** or **Nagad** to:
                                            </div>
                                            <div className="bg-neutral-800 text-white p-3 rounded-lg font-mono text-center tracking-widest text-lg select-all">
                                                01712-345678
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-1 text-center">(Personal Account)</div>
                                        </div>

                                        <div>
                                            <label htmlFor="trxid" className="block text-sm font-medium text-neutral-300 mb-2">
                                                2. Enter your Transaction ID (TrxID)
                                            </label>
                                            <input
                                                id="trxid"
                                                type="text"
                                                value={trxId}
                                                onChange={(e) => setTrxId(e.target.value)}
                                                placeholder="e.g. 8JH3K9L2M"
                                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#4f9e97] focus:border-transparent transition-all uppercase"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {status === 'error' && (
                                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex gap-2 items-start">
                                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                            <span>{errorMessage}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-3 rounded-xl font-bold btn-primary text-white shadow-lg shadow-[#4f9e97]/20 border border-[#4f9e97] disabled:opacity-50 flex justify-center items-center"
                                    >
                                        {status === 'loading' ? (
                                            <><Loader2 size={18} className="animate-spin mr-2" /> Submitting...</>
                                        ) : (
                                            'Verify Payment'
                                        )}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
