import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import MarkdownViewer from '../../Components/MarkdownViewer';
import { Spinner } from '../../Components/Feedback';

export default function Show({ post, categories }) {
    const [toggling, setToggling] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const badge = categories.find((c) => c.value === post.category)?.badgeClass || 'bg-slate-200 text-slate-900 border-slate-300';

    const togglePublish = () => {
        setToggling(true);
        router.patch(`/dashboard/posts/${post.id}/publish`, {}, { preserveScroll: true, onFinish: () => setToggling(false) });
    };

    const destroy = () => {
        if (!window.confirm('Hapus artikel ini secara permanen?')) return;
        setDeleting(true);
        router.delete(`/dashboard/posts/${post.id}`, { onFinish: () => setDeleting(false) });
    };

    return (
        <AppLayout>
            <Head title={post.title} />

            <div className="max-w-4xl mx-auto">
                <Link href="/dashboard/posts" className="text-sm font-semibold text-indigo-800 hover:text-indigo-950 cursor-pointer">
                    ← Kembali ke daftar artikel
                </Link>

                <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} width="800" height="450" decoding="async" className="w-full max-h-80 object-cover" />}
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className={`px-2.5 py-0.5 rounded-full border font-semibold ${badge}`}>{post.category}</span>
                            <span
                                className={`px-2.5 py-0.5 rounded-full border font-semibold ${
                                    post.is_published
                                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                        : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                            >
                                {post.is_published ? 'Terpublikasi' : 'Draf'}
                            </span>
                        </div>
                        <h1 className="mt-3 text-3xl font-extrabold text-slate-900">{post.title}</h1>
                        {post.excerpt && <p className="mt-2 text-slate-700">{post.excerpt}</p>}
                        <p className="mt-3 text-xs text-slate-700">
                            Dibuat {post.created_at} · Diperbarui {post.updated_at}
                            {post.published_at ? ` · Dipublikasikan ${post.published_at}` : ''}
                        </p>

                        {post.is_owner && (
                            <div className="mt-5 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={togglePublish}
                                    disabled={toggling}
                                    className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold inline-flex items-center space-x-2 cursor-pointer disabled:opacity-60"
                                >
                                    {toggling && <Spinner />}
                                    <span>{post.is_published ? 'Jadikan Draf' : 'Publikasikan'}</span>
                                </button>
                                {post.is_published && (
                                    <Link
                                        href={`/articles/${post.slug}`}
                                        className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                                    >
                                        Lihat Halaman Publik
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    onClick={destroy}
                                    disabled={deleting}
                                    className="px-4 py-2 rounded-xl border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-50 inline-flex items-center space-x-2 cursor-pointer disabled:opacity-60"
                                >
                                    {deleting && <Spinner />}
                                    <span>Hapus</span>
                                </button>
                            </div>
                        )}

                        <hr className="my-6 border-slate-200" />
                        <MarkdownViewer content={post.content} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
