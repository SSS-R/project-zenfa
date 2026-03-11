'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, CheckCircle2, Eye, Trash2, Star, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminArticles() {
    const { data: session } = useSession();
    const [articles, setArticles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Create form state
    const [newArticle, setNewArticle] = useState({
        title: '',
        excerpt: '',
        body: '',
        category: 'gpu',
        thumbnail_url: '',
        source_name: 'PC Lagbe',
        source_url: ''
    });

    useEffect(() => {
        if (session?.accessToken) {
            fetchArticles();
        }
    }, [session, filter]);

    const fetchArticles = async () => {
        setIsLoading(true);
        try {
            const url = filter === 'ALL' 
                ? 'http://localhost:8001/admin/articles/' 
                : `http://localhost:8001/admin/articles/?status=${filter}`;
                
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setArticles(data);
            } else {
                toast.error('Failed to fetch articles');
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            toast.error('Network error while fetching articles');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const slug = newArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const payload = {
                ...newArticle,
                slug,
                status: 'PUBLISHED', // Manual articles are published immediately
                source: 'admin' // Required SourceEnum type
            };

            const response = await fetch('http://localhost:8001/admin/articles/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success('Article published successfully!');
                setShowCreateModal(false);
                setNewArticle({
                    title: '', excerpt: '', body: '', category: 'gpu', thumbnail_url: '', source_name: 'PC Lagbe', source_url: ''
                });
                fetchArticles();
            } else {
                const err = await response.json();
                toast.error(err.detail || 'Failed to create article');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handlePublishToggle = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
        try {
            const response = await fetch(`http://localhost:8001/admin/articles/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast.success(`Article marked as ${newStatus}`);
                fetchArticles();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleFeatureToggle = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:8001/admin/articles/${id}/feature`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });

            if (response.ok) {
                toast.success('Feature status updated');
                fetchArticles();
            } else {
                toast.error('Failed to update feature status');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!process.browser || !window.confirm('Are you sure you want to delete this article?')) return;
        
        try {
            const response = await fetch(`http://localhost:8001/admin/articles/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });

            if (response.ok) {
                toast.success('Article deleted');
                fetchArticles();
            } else {
                toast.error('Failed to delete article');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-white">Manage News Articles</h1>
                <div className="flex gap-2">
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#4f9e97]"
                    >
                        <option value="ALL">All Articles</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Drafts (Review Queue)</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[#4f9e97] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#3d7a74] transition"
                    >
                        <Plus className="w-4 h-4" /> Create Article
                    </button>
                </div>
            </div>

            {/* Create Article Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Create New Article</h2>
                        <form onSubmit={handleCreateArticle} className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Title</label>
                                <input required type="text" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Category</label>
                                    <select value={newArticle.category} onChange={e => setNewArticle({...newArticle, category: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-white">
                                        <option value="gpu">GPU</option>
                                        <option value="cpu">CPU</option>
                                        <option value="ram_storage">RAM & Storage</option>
                                        <option value="deals">Deals</option>
                                        <option value="benchmarks">Benchmarks</option>
                                        <option value="bd_news">BD News</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Thumbnail URL</label>
                                    <input type="url" value={newArticle.thumbnail_url} onChange={e => setNewArticle({...newArticle, thumbnail_url: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-white" placeholder="https://..." />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Excerpt (Short Summary)</label>
                                <textarea required rows={2} value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Content (Markdown supported)</label>
                                <textarea required rows={6} value={newArticle.body} onChange={e => setNewArticle({...newArticle, body: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white transition">Cancel</button>
                                <button type="submit" className="bg-[#4f9e97] text-black font-bold px-6 py-2 rounded-lg hover:bg-[#3d7a74] transition">Publish Article</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="glass-card overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#4f9e97]" />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="p-12 text-center text-neutral-500">
                        No articles found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-900/50 border-b border-neutral-800 text-neutral-400 text-sm">
                                <tr>
                                    <th className="p-4 font-medium">Title</th>
                                    <th className="p-4 font-medium">Category</th>
                                    <th className="p-4 font-medium">Source</th>
                                    <th className="p-4 font-medium w-32">Status</th>
                                    <th className="p-4 font-medium text-right w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {articles.map((article) => (
                                    <tr key={article.id} className="hover:bg-neutral-900/30 transition">
                                        <td className="p-4">
                                            <div className="font-medium text-white line-clamp-1">{article.title}</div>
                                            <div className="text-xs text-neutral-500 mt-1">{new Date(article.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300 uppercase tracking-wider">
                                                {article.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-neutral-400">
                                                {article.source_site || 'Manual'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => handlePublishToggle(article.id, article.status)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition flex items-center gap-1 ${
                                                    article.status === 'PUBLISHED' 
                                                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                                                        : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                                }`}
                                            >
                                                {article.status === 'PUBLISHED' ? <CheckCircle2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                {article.status}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleFeatureToggle(article.id)}
                                                    className={`p-2 rounded-lg transition ${
                                                        article.is_featured 
                                                            ? 'bg-[#4f9e97]/20 text-[#4f9e97]' 
                                                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                                                    }`}
                                                    title={article.is_featured ? "Featured (Click to Unfeature)" : "Set as Featured Hero"}
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(article.id)}
                                                    className="p-2 bg-neutral-800 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                                                    title="Delete Article"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
