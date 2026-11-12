import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import { Spinner } from '../../Components/Feedback';

export default function PostIndex({ posts, filters, categories }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [searching, setSearching] = useState(false);

    const visit = (params) => {
        setSearching(true);
        router.get('/articles', params, { preserveState: true, onFinish: () => setSearching(false) });
    };

    const submit = (e) => {
        e.preventDefault();
        visit({ search, category: filters?.category || '' });
    };

    const categoryClass = (active) =>
        `px-3.5 py-1.5 rounded-full text-sm font-semibold border transition cursor-pointer ${
            active ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-500'
        }`;

    return (
        <PublicLayout>
            <Head title="Beranda" />

            {/* Hero Banner */}
            <section id="hero-banner" className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest bg-indigo-950 text-white border border-indigo-300 px-3 py-1 rounded-full">
                        Platform Blog Komunitas
                    </span>
                    <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                        Tulis Gagasanmu, Bagikan ke Dunia.
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-white text-lg">
                        BlogVerse Pro membantu penulis menerbitkan artikel, mengelola draf, dan menjangkau pembaca — dibantu AI.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={auth.user.role === 'admin' ? '/admin/users' : '/dashboard/posts'}
                                className="px-6 py-3 rounded-xl bg-white text-indigo-950 font-bold shadow hover:bg-indigo-50 cursor-pointer"
                            >
                                Ke Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/register"
                                    className="px-6 py-3 rounded-xl bg-white text-indigo-950 font-bold shadow hover:bg-indigo-50 cursor-pointer"
                                >
                                    Mulai Menulis Gratis
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-6 py-3 rounded-xl bg-indigo-950 border border-white text-white font-semibold hover:bg-indigo-900 cursor-pointer"
                                >
                                    Masuk
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Artikel Terbaru</h2>
                        <p className="text-sm text-slate-700 mt-1">Bacaan pilihan dari para penulis BlogVerse Pro.</p>
                    </div>
                    <form onSubmit={submit} className="flex w-full md:w-auto space-x-2">
                        <label htmlFor="public-search" className="sr-only">Cari artikel</label>
                        <input
                            id="public-search"
                            type="text"
                            aria-label="Cari artikel"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari artikel..."
                            className="flex-1 md:w-72 px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                        <button
                            type="submit"
                            disabled={searching}
                            className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold rounded-xl cursor-pointer inline-flex items-center space-x-2 disabled:opacity-60"
                        >
                            {searching && <Spinner />}
                            <span>Cari</span>
                        </button>
                    </form>
                </div>

                <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter kategori artikel">
                    <button type="button" onClick={() => visit({ search })} className={categoryClass(!filters?.category)}>
                        Semua
                    </button>
                    {categories.map((c) => (
                        <button
                            key={c.value}
                            type="button"
                            onClick={() => visit({ search, category: c.value })}
                            className={categoryClass(filters?.category === c.value)}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                {posts.data.length === 0 ? (
                    <div className="mt-10 text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-700">
                        Belum ada artikel yang dipublikasikan.
                    </div>
                ) : (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.data.map((post) => (
                            <article key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col">
                                {post.cover_image_url ? (
                                    <img src={post.cover_image_url} alt={post.title} className="h-44 w-full object-cover" />
                                ) : (
                                    <div aria-hidden="true" className="h-44 bg-indigo-100 flex items-center justify-center text-4xl font-black text-indigo-900">
                                        {post.title?.charAt(0)}
                                    </div>
                                )}
                                <div className="p-5 flex-1 flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-wide text-indigo-800">{post.category}</span>
                                    <h3 className="mt-2 text-lg font-bold text-slate-900 leading-snug">
                                        <Link href={`/articles/${post.slug}`} className="hover:text-indigo-800 cursor-pointer">
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-700 line-clamp-3 flex-1">{post.excerpt}</p>
                                    <div className="mt-4 flex items-center justify-between text-xs text-slate-700 font-medium">
                                        <span>{post.author?.name}</span>
                                        <span>{post.published_at}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {posts.last_page > 1 && (
                    <div className="mt-8 flex flex-wrap justify-center gap-2">
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
            </section>
        </PublicLayout>
    );
}
