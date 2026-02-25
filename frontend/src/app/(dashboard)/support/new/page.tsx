'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShadowOverlay } from '@/components/ui/shadow-overlay';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function NewTicketPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('other');
    const [priority, setPriority] = useState('normal');
    const [message, setMessage] = useState('');

    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.accessToken) {
            setStatus('error');
            setErrorMessage('You must be logged in to create a ticket.');
            return;
        }

        if (!subject.trim() || !message.trim()) {
            setStatus('error');
            setErrorMessage('Subject and message are required.');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            // 1. Create the ticket
            const ticketRes = await fetch('http://localhost:8001/support/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({
                    subject: subject.trim(),
                    category: category,
                    priority: priority
                })
            });

            if (!ticketRes.ok) {
                const errorData = await ticketRes.json();
                throw new Error(errorData.detail || 'Failed to create ticket.');
            }

            const ticket = await ticketRes.json();

            // 2. Add the initial message
            const msgRes = await fetch(`http://localhost:8001/support/tickets/${ticket.id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({
                    message: message.trim()
                })
            });

            if (!msgRes.ok) {
                const errorData = await msgRes.json();
                throw new Error(errorData.detail || 'Ticket created, but failed to post initial message.');
            }

            // Redirect to the ticket thread
            router.push(`/support/${ticket.id}`);
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 relative">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ShadowOverlay />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="mb-8">
                    <Link href="/support" className="text-neutral-400 hover:text-white text-sm mb-2 inline-block">
                        &larr; Back to Tickets
                    </Link>
                    <h1 className="text-3xl font-bold">Open a Support Ticket</h1>
                    <p className="text-neutral-400 mt-2">We typically reply within 24 hours.</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'error' && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex gap-3 items-start">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300">Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#4f9e97]"
                                >
                                    <option value="payment">Payment Issue</option>
                                    <option value="build_issue">PC Builder Issue</option>
                                    <option value="account">Account Issue</option>
                                    <option value="other">Other / General Inquiry</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300">Priority</label>
                                <select
                                    value={priority}
                                    onChange={e => setPriority(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#4f9e97]"
                                >
                                    <option value="low">Low - General Feedback</option>
                                    <option value="normal">Normal - Question/Issue</option>
                                    <option value="high">High - Can't use tokens/paid features</option>
                                    <option value="urgent">Urgent - Payment deduction without tokens</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="E.g., I paid but didn't receive tokens"
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#4f9e97]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Message</label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Please describe the issue in detail. If it's a payment issue, include the bKash/Nagad number you sent from."
                                rows={6}
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#4f9e97] resize-none"
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full md:w-auto px-8 py-3 rounded-xl font-bold btn-primary text-white shadow-lg shadow-[#4f9e97]/20 border border-[#4f9e97] disabled:opacity-50 flex justify-center items-center"
                            >
                                {status === 'loading' ? (
                                    <><Loader2 size={18} className="animate-spin mr-2" /> Submitting...</>
                                ) : (
                                    'Create Ticket'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
