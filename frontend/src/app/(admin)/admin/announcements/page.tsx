'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

export default function AdminAnnouncementsPage() {
    const { data: session } = useSession();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');
    const [isActive, setIsActive] = useState(true);

    const fetchAnnouncements = async () => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8001/admin/announcements', {
                headers: { 'Authorization': `Bearer ${session.accessToken}` }
            });
            if (!res.ok) throw new Error('Failed to fetch announcements');
            const data = await res.json();
            setAnnouncements(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchAnnouncements();
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:8001/admin/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({
                    title,
                    message,
                    type,
                    is_active: isActive
                })
            });

            if (!res.ok) throw new Error('Failed to create announcement');

            setTitle('');
            setMessage('');
            setType('info');
            setIsActive(true);
            setShowForm(false);
            fetchAnnouncements();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`http://localhost:8001/admin/announcements/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({ is_active: !currentStatus })
            });

            if (!res.ok) throw new Error('Failed to update status');
            fetchAnnouncements();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement permanently?')) return;

        try {
            const res = await fetch(`http://localhost:8001/admin/announcements/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });

            if (!res.ok) throw new Error('Failed to delete announcement');
            fetchAnnouncements();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const getTypeColor = (t: string) => {
        switch (t) {
            case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">System Announcements</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary rounded-xl px-4 py-2 text-sm flex items-center gap-2"
                >
                    <Plus size={16} /> New Announcement
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-6 border-[#4f9e97]/30 bg-[#4f9e97]/5">
                    <h2 className="text-lg font-bold mb-4">Create Announcement</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm focus:outline-none focus:border-[#4f9e97]"
                                    placeholder="e.g. Scheduled Maintenance"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm focus:outline-none focus:border-[#4f9e97]"
                                >
                                    <option value="info">Info (Blue)</option>
                                    <option value="success">Success (Green)</option>
                                    <option value="warning">Warning (Yellow)</option>
                                    <option value="error">Error (Red)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Message</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm focus:outline-none focus:border-[#4f9e97]"
                                rows={3}
                                placeholder="Message content to display to users..."
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-[#4f9e97] focus:ring-[#4f9e97]"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium">Publish Immediately</label>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 rounded-lg border border-neutral-700 text-sm hover:bg-neutral-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary rounded-lg px-6 py-2 text-sm flex items-center justify-center min-w-[120px]"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12 text-[#4f9e97]"><Loader2 className="animate-spin w-8 h-8" /></div>
            ) : error ? (
                <div className="p-8 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</div>
            ) : announcements.length === 0 ? (
                <div className="glass-card p-12 text-center text-neutral-500 border border-neutral-800 border-dashed rounded-2xl">
                    <p>No announcements found. Create one above to broadcast messages to users.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="glass-card p-5 relative overflow-hidden flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${announcement.type === 'error' ? 'bg-red-500' : announcement.type === 'warning' ? 'bg-yellow-500' : announcement.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />

                            <div className="flex-1 pl-3">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getTypeColor(announcement.type)}`}>
                                        {announcement.type}
                                    </span>
                                    {!announcement.is_active && (
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-neutral-800 border-neutral-700 text-neutral-400">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-white leading-tight mb-1">{announcement.title}</h3>
                                <p className="text-sm text-neutral-400 mb-2">{announcement.message}</p>
                                <div className="text-xs text-neutral-600">
                                    Created: {new Date(announcement.created_at).toLocaleString()}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-neutral-800">
                                <button
                                    onClick={() => toggleStatus(announcement.id, announcement.is_active)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors w-full md:w-auto ${announcement.is_active
                                            ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                                        }`}
                                >
                                    {announcement.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => handleDelete(announcement.id)}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
