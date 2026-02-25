'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, AlertCircle, Edit2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminTransactionsPage() {
    const { data: session } = useSession();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');

    const fetchTransactions = async () => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const url = statusFilter === 'all'
                ? 'http://localhost:8001/admin/transactions'
                : `http://localhost:8001/admin/transactions?status=${statusFilter}`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${session.accessToken}` }
            });
            if (!res.ok) throw new Error('Failed to fetch transactions');
            const data = await res.json();
            setTransactions(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchTransactions();
    }, [session, statusFilter]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to mark this transaction as ${newStatus}?`)) return;

        try {
            const res = await fetch(`http://localhost:8001/admin/transactions/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Update failed');

            // Re-fetch to update the list
            fetchTransactions();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">Transactions Overview</h1>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">Filter Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 text-white text-sm rounded-lg py-2 px-3 focus:ring-[#4f9e97]"
                    >
                        <option value="pending">Pending TrxID Validation</option>
                        <option value="success">Approved</option>
                        <option value="failed">Rejected/Failed</option>
                        <option value="all">All Transactions</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12 text-[#4f9e97]"><Loader2 className="animate-spin w-8 h-8" /></div>
            ) : error ? (
                <div className="p-8 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-300">
                            <thead className="bg-neutral-900/80 text-xs uppercase font-medium text-neutral-400 border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Package</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Tokens</th>
                                    <th className="px-6 py-4">Gateway & TrxID</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                                            No {statusFilter !== 'all' ? statusFilter : ''} transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map(tx => (
                                        <tr key={tx.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                                <div className="text-xs text-neutral-500">{new Date(tx.created_at).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-6 py-4 capitalize font-medium text-white">
                                                {tx.package}
                                            </td>
                                            <td className="px-6 py-4">
                                                ৳ {tx.amount_bdt}
                                            </td>
                                            <td className="px-6 py-4 text-[#4f9e97] font-bold">
                                                +{tx.tokens_granted}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="capitalize font-medium">{tx.gateway}</div>
                                                <div className="text-xs font-mono bg-neutral-900 mt-1 px-2 py-0.5 rounded text-neutral-400 border border-neutral-800 select-all">
                                                    {tx.gateway_trx_id || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tx.status === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                        tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                            'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                                {tx.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(tx.id, 'success')}
                                                            className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors border border-green-500/30"
                                                            title="Approve & Grant Tokens"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(tx.id, 'failed')}
                                                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/30"
                                                            title="Reject Payment"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                {tx.status === 'success' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(tx.id, 'refunded')}
                                                        className="text-xs text-neutral-500 hover:text-red-400 underline transition-colors"
                                                    >
                                                        Refund
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
