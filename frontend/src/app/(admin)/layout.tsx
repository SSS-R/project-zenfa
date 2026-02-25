'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ShadowOverlay } from '@/components/ui/shadow-overlay';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
            router.push('/dashboard');
        } else {
            setIsAuthorized(true);
        }
    }, [session, status, router]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f9e97]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 relative">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ShadowOverlay />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row gap-8">
                {/* Admin Sidebar */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="glass-card p-6 sticky top-28">
                        <h2 className="text-[#4f9e97] font-bold text-lg mb-6 tracking-wide uppercase">Admin Portal</h2>
                        <nav className="space-y-2">
                            <Link href="/admin" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition">Dashboard</Link>
                            <Link href="/admin/users" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition">Users & Tokens</Link>
                            <Link href="/admin/transactions" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition">Transactions</Link>
                            <Link href="/admin/tickets" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition">Support Tickets</Link>
                        </nav>
                        <div className="mt-8 pt-6 border-t border-neutral-800">
                            <Link href="/dashboard" className="text-neutral-500 hover:text-white text-sm flex items-center gap-2">
                                &larr; Exit Admin
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
