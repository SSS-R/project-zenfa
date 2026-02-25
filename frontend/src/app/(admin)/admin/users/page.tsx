'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, AlertCircle, Edit2, ShieldAlert } from 'lucide-react';

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8001/admin/users', {
                headers: { 'Authorization': `Bearer ${session.accessToken}` }
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchUsers();
    }, [session]);

    const handleUpdateTokens = async (userId: string, currentTokens: number) => {
        const newTokens = prompt("Enter new token balance:", currentTokens.toString());
        if (newTokens === null) return;

        const tokenInt = parseInt(newTokens, 10);
        if (isNaN(tokenInt) || tokenInt < 0) {
            alert("Please enter a valid positive number.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8001/admin/users/${userId}/tokens`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token_balance: tokenInt })
            });

            if (!res.ok) throw new Error('Update failed');
            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleUpdateRole = async (userId: string, currentRole: string) => {
        const newRole = prompt("Enter new role (user, admin, support):", currentRole);
        if (newRole === null) return;

        if (!['user', 'admin', 'support'].includes(newRole.toLowerCase())) {
            alert("Invalid role. Must be 'user', 'admin', or 'support'.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8001/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole.toLowerCase() })
            });

            if (!res.ok) throw new Error('Update failed');
            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">User Management</h1>

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
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Tokens</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-neutral-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{user.display_name || 'Anonymous User'}</div>
                                            <div className="text-xs text-neutral-500">{user.email}</div>
                                            <div className="text-[10px] text-neutral-600 font-mono mt-1">ID: {user.id.substring(0, 8)}...</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-[#4f9e97]/10 text-[#4f9e97] border border-[#4f9e97]/20' :
                                                    user.role === 'support' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                        'bg-neutral-800 text-neutral-400 border border-neutral-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-white">{user.token_balance}</span>
                                                <button
                                                    onClick={() => handleUpdateTokens(user.id, user.token_balance)}
                                                    className="p-1 text-neutral-500 hover:text-[#4f9e97] transition-colors"
                                                    title="Adjust Tokens"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleUpdateRole(user.id, user.role)}
                                                className="text-xs flex items-center gap-1 ml-auto text-neutral-400 hover:text-white transition-colors px-3 py-1.5 border border-neutral-700 rounded-lg hover:border-neutral-500 hover:bg-neutral-800"
                                            >
                                                <ShieldAlert size={14} /> View / Change Role
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
