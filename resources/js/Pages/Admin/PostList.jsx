import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Spinner } from '../../Components/Feedback';

export default function PostList({ posts, filters, categories }) {
    const [search, setSearch] = useState(filters.search || '');
    const [loading, setLoading] = useState(false);

    const apply = (extra = {}) => {
        setLoading(true);
        router.get('/admin/posts', { search, status: filters.status, category: filters.category, ...extra }, { preserveState: true, onFinish: () => setLoading(false) });
    };

    return (
        <AppLayout>
            <Head title="Semua Artikel" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Semua Artikel</h1>
                    <p className="text-sm text-slate-700 mt-1">Daftar seluruh artikel dari semua penulis (hanya baca).</p>
                </div>
                <a href="/admin/posts/export" className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold cursor-pointer">
                    Ekspor Excel
                </a>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-2">
                <label htmlFor="admin-post-search" className="sr-only">Cari artikel</label>
                <input
                    id="admin-post-search"
                    type="text"
                    aria-label="Cari artikel"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari artikel..."
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900"
                />
                <label htmlFor="admin-post-category" className="sr-only">Filter kategori</label>
                <select
                    id="admin-post-category"
                    aria-label="Filter kategori"
                    value={filters.category}
                    onChange={(e) => apply({ category: e.target.value })}
                    className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 cursor-pointer"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <label htmlFor="admin-post-status" className="sr-only">Filter status</label>
                <select
                    id="admin-post-status"
                    aria-label="Filter status"
                    value={filters.status}
                    onChange={(e) => apply({ status: e.target.value })}
                    className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 cursor-pointer"
                >
                    <option value="">Semua Status</option>
                    <option value="published">Terpublikasi</option>
                    <option value="draft">Draf</option>
                </select>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                >
                    {loading && <Spinner />}<span>Cari</span>
                </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-800 text-xs font-bold uppercase">
                        <tr>
                            <th className="px-5 py-3 text-left">Judul</th>
                            <th className="px-5 py-3 text-left">Penulis</th>
                            <th className="px-5 py-3 text-left">Kategori</th>
                            <th className="px-5 py-3 text-center">Status</th>
                            <th className="px-5 py-3 text-left">Dibuat</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {posts.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-5 py-10 text-center text-slate-700">Tidak ada artikel.</td>
                            </tr>
                        )}
                        {posts.data.map((post) => (
                            <tr key={post.id} className="hover:bg-slate-50">
                                <td className="px-5 py-3 font-semibold text-slate-900">{post.title}</td>
                                <td className="px-5 py-3">
                                    {post.author && (
                                        <Link href={`/admin/users/${post.author.id}/posts`} className="text-indigo-800 font-semibold hover:underline cursor-pointer">
                                            {post.author.name}
                                        </Link>
                                    )}
                                </td>
                                <td className="px-5 py-3 text-slate-800">{post.category}</td>
                                <td className="px-5 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${
                                        post.is_published ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                                    }`}>
                                        {post.is_published ? 'Terpublikasi' : 'Draf'}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-slate-700">{post.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {posts.last_page > 1 && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {posts.links.map((link, i) => (
                        <button
                            key={i}
                            type="button"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer ${
                                link.active ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                            } disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
