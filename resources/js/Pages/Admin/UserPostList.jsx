import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Spinner } from '../../Components/Feedback';

export default function UserPostList({ targetUser, posts, filters, categories }) {
    const [search, setSearch] = useState(filters.search || '');
    const [loading, setLoading] = useState(false);
    const base = `/admin/users/${targetUser.id}/posts`;

    const apply = (extra = {}) => {
        setLoading(true);
        router.get(base, { search, status: filters.status, category: filters.category, ...extra }, { preserveState: true, onFinish: () => setLoading(false) });
    };

    return (
        <AppLayout>
            <Head title={`Artikel ${targetUser.name}`} />

            <Link href="/admin/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">← Kembali ke daftar user</Link>

            <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Artikel {targetUser.name}</h1>
                    <p className="text-sm text-slate-500 mt-1">@{targetUser.username} · {targetUser.email} · {targetUser.role}</p>
                </div>
                <a href={`${base}/export`} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer">Ekspor Excel</a>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-2">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari artikel..." className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm" />
                <select value={filters.category} onChange={(e) => apply({ category: e.target.value })} className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm cursor-pointer">
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <select value={filters.status} onChange={(e) => apply({ status: e.target.value })} className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm cursor-pointer">
                    <option value="">Semua Status</option>
                    <option value="published">Terpublikasi</option>
                    <option value="draft">Draf</option>
                </select>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60">
                    {loading && <Spinner />}<span>Cari</span>
                </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
                {posts.data.length === 0 && <div className="p-10 text-center text-slate-500 text-sm">User ini belum memiliki artikel.</div>}
                {posts.data.map((post) => (
                    <div key={post.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{post.title}</p>
                            <p className="text-sm text-slate-500 truncate">{post.excerpt || 'Tanpa ringkasan'}</p>
                            <p className="text-xs text-slate-400 mt-1">{post.category} · {post.created_at}</p>
                        </div>
                        <span className={`shrink-0 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${post.is_published ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>{post.is_published ? 'Terpublikasi' : 'Draf'}</span>
                    </div>
                ))}
            </div>

            {posts.last_page > 1 && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {posts.links.map((link, i) => (
                        <button key={i} type="button" disabled={!link.url} onClick={() => link.url && router.get(link.url, {}, { preserveState: true })} className={`px-3.5 py-1.5 rounded-lg text-sm border cursor-pointer ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'} disabled:opacity-40`} dangerouslySetInnerHTML={{ __html: link.label }} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
