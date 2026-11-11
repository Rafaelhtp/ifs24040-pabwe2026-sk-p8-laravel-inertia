import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import MarkdownViewer from '../../Components/MarkdownViewer';

export default function PostShow({ post, related }) {
    const { auth } = usePage().props;

    return (
        <PublicLayout>
            <Head title={post.title} />

            <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
                <Link href="/articles" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">← Kembali ke artikel</Link>

                <span className="block mt-5 text-xs font-bold uppercase tracking-wide text-indigo-600">{post.category}</span>
                <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">{post.title}</h1>
                <div className="mt-3 text-sm text-slate-500">
                    Oleh <span className="font-semibold text-slate-700">{post.author?.name}</span> · {post.published_at}
                </div>

                {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} className="mt-6 w-full max-h-96 object-cover rounded-2xl" />}

                <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-8">
                    <MarkdownViewer content={post.content} />
                </div>

                {/* Community CTA Card */}
                <section id="community-cta" className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 text-center shadow-lg">
                    <h2 className="text-2xl font-extrabold">Suka dengan tulisan ini?</h2>
                    <p className="mt-2 text-indigo-100">Bergabunglah dengan komunitas BlogVerse Pro dan mulai terbitkan artikelmu sendiri.</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {auth?.user ? (
                            <Link href="/dashboard/posts" className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 cursor-pointer">Buka Dashboard</Link>
                        ) : (
                            <>
                                <Link href="/register" className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 cursor-pointer">Daftar Sekarang</Link>
                                <Link href="/login" className="px-6 py-3 rounded-xl border border-white/60 font-semibold hover:bg-white/10 cursor-pointer">Sudah Punya Akun? Masuk</Link>
                            </>
                        )}
                    </div>
                </section>
            </article>

            {related?.length > 0 && (
                <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-14">
                    <h2 className="text-xl font-extrabold text-slate-900">Baca Juga</h2>
                    <div className="mt-5 grid gap-5 sm:grid-cols-3">
                        {related.map((item) => (
                            <Link key={item.id} href={`/articles/${item.slug}`} className="block bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition cursor-pointer">
                                <span className="text-xs font-bold uppercase text-indigo-600">{item.category}</span>
                                <p className="mt-2 font-bold text-slate-900 leading-snug">{item.title}</p>
                                <p className="mt-1 text-xs text-slate-500">{item.published_at}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
