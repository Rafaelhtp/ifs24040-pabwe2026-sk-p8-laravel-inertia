import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Spinner } from '../../Components/Feedback';

const MarkdownEditor = lazy(() => import('../../Components/MarkdownEditor'));

const emptyForm = { title: '', category: 'Umum', excerpt: '', content: '', is_published: false };

function StatCard({ label, value, tone }) {
    const tones = {
        indigo: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        emerald: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        amber: 'bg-amber-100 text-amber-900 border-amber-300',
    };

    return (
        <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
            <h2 className="text-sm font-bold">{label}</h2>
            <p className="text-3xl font-extrabold mt-1">{value}</p>
        </div>
    );
}

function KebabMenu({ post, onEdit, onDelete }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const close = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-lg text-slate-700 hover:bg-slate-100 text-xl font-bold cursor-pointer"
                aria-label={`Menu tindakan untuk ${post.title}`}
            >
                ⋮
            </button>
            {open && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                    <Link
                        href={`/dashboard/posts/${post.id}`}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-50 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Detail</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onEdit(post);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-50 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Ubah</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onDelete(post);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Hapus</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Index({ posts, filters, categories, stats }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [aiOpen, setAiOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiCount, setAiCount] = useState(3);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSaving, setAiSaving] = useState(false);
    const [aiItems, setAiItems] = useState([]);
    const [importing, setImporting] = useState(false);
    const [coverBusy, setCoverBusy] = useState(false);
    const fileInput = useRef(null);
    const coverInput = useRef(null);

    const categoryBadge = (value) =>
        categories.find((c) => c.value === value)?.badgeClass || 'bg-slate-200 text-slate-900 border-slate-300';
    const currentPost = editing ? posts.data.find((p) => p.id === editing.id) || editing : null;

    const applyFilters = (extra = {}) => {
        router.get('/dashboard/posts', { search, status: filters.status, category: filters.category, ...extra }, { preserveState: true, preserveScroll: true });
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setErrors({});
        setFormOpen(true);
    };

    const openEdit = (post) => {
        setEditing(post);
        setErrors({});
        setForm({
            title: post.title,
            category: post.category,
            excerpt: post.excerpt || '',
            content: post.content || '',
            is_published: post.is_published,
        });
        setFormOpen(true);
    };

    const submitForm = (e) => {
        e.preventDefault();
        setSaving(true);
        const options = {
            preserveScroll: true,
            onError: (errs) => setErrors(errs),
            onSuccess: () => setFormOpen(false),
            onFinish: () => setSaving(false),
        };
        if (editing) {
            router.put(`/dashboard/posts/${editing.id}`, form, options);
        } else {
            router.post('/dashboard/posts', form, options);
        }
    };

    const confirmDelete = () => {
        setDeleteBusy(true);
        router.delete(`/dashboard/posts/${deleting.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
            onFinish: () => setDeleteBusy(false),
        });
    };

    const togglePublish = (post) => {
        setTogglingId(post.id);
        router.patch(`/dashboard/posts/${post.id}/publish`, {}, { preserveScroll: true, onFinish: () => setTogglingId(null) });
    };

    const uploadCover = (e) => {
        const file = e.target.files?.[0];
        if (!file || !editing) return;
        setCoverBusy(true);
        router.post(
            `/dashboard/posts/${editing.id}/cover`,
            { coverPhoto: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => {
                    setCoverBusy(false);
                    e.target.value = '';
                },
            }
        );
    };

    const removeCover = () => {
        setCoverBusy(true);
        router.delete(`/dashboard/posts/${editing.id}/cover`, { preserveScroll: true, onFinish: () => setCoverBusy(false) });
    };

    const importExcel = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        router.post(
            '/dashboard/posts/import',
            { importFile: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => {
                    setImporting(false);
                    e.target.value = '';
                },
            }
        );
    };

    const generateAi = (e) => {
        e.preventDefault();
        setAiLoading(true);
        router.post(
            '/dashboard/posts/ai-generate',
            { prompt: aiPrompt, count: aiCount },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    const items = page.props.flash?.aiGeneratedItems || [];
                    setAiItems(items.map((item) => ({ ...item, selected: true })));
                },
                onFinish: () => setAiLoading(false),
            }
        );
    };

    const saveAi = () => {
        const items = aiItems.filter((i) => i.selected).map(({ selected, ...rest }) => rest);
        if (items.length === 0) return;
        setAiSaving(true);
        router.post(
            '/dashboard/posts/ai-save',
            { items },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAiOpen(false);
                    setAiItems([]);
                    setAiPrompt('');
                },
                onFinish: () => setAiSaving(false),
            }
        );
    };

    const statusBtn = (value, label) => (
        <button
            type="button"
            key={value}
            onClick={() => applyFilters({ status: value })}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border cursor-pointer ${
                filters.status === value
                    ? 'bg-indigo-700 text-white border-indigo-700'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-500'
            }`}
        >
            {label}
        </button>
    );

    return (
        <AppLayout>
            <Head title="Artikel Saya" />

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Artikel Saya</h1>
                    <p className="text-sm text-slate-700 mt-1">Kelola artikel, draf, dan publikasi Anda.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setAiOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-sm font-semibold cursor-pointer"
                    >
                        ✨ Generate AI
                    </button>
                    <a
                        href="/dashboard/posts/export"
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold cursor-pointer"
                    >
                        Ekspor Excel
                    </a>
                    <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        disabled={importing}
                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold cursor-pointer inline-flex items-center space-x-2 disabled:opacity-60"
                    >
                        {importing && <Spinner />}
                        <span>Impor Excel</span>
                    </button>
                    <input
                        ref={fileInput}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        aria-label="Impor file Excel"
                        className="hidden"
                        onChange={importExcel}
                    />
                    <button
                        type="button"
                        onClick={openCreate}
                        className="px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold shadow-sm cursor-pointer"
                    >
                        + Tulis Artikel
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <StatCard label="Total Artikel" value={stats.total} tone="indigo" />
                <StatCard label="Total Selesai" value={stats.published} tone="emerald" />
                <StatCard label="Belum Selesai" value={stats.draft} tone="amber" />
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 space-y-3">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        applyFilters();
                    }}
                    className="flex flex-col sm:flex-row gap-2"
                >
                    <label htmlFor="dashboard-post-search" className="sr-only">Cari artikel saya</label>
                    <input
                        id="dashboard-post-search"
                        type="text"
                        aria-label="Cari artikel saya"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari judul, ringkasan, atau isi..."
                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <label htmlFor="dashboard-post-category" className="sr-only">Filter kategori artikel</label>
                    <select
                        id="dashboard-post-category"
                        aria-label="Filter kategori artikel"
                        value={filters.category}
                        onChange={(e) => applyFilters({ category: e.target.value })}
                        className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 cursor-pointer"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-sm font-semibold rounded-xl cursor-pointer"
                    >
                        Cari
                    </button>
                </form>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status publikasi">
                    {statusBtn('', 'Semua')}
                    {statusBtn('published', 'Terpublikasi')}
                    {statusBtn('draft', 'Draf')}
                </div>
            </div>

            {/* List view */}
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
                {posts.data.length === 0 && (
                    <div className="p-10 text-center text-slate-700 text-sm">
                        Belum ada artikel. Mulai dengan menekan &quot;Tulis Artikel&quot;.
                    </div>
                )}
                {posts.data.map((post) => (
                    <div key={post.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                        <div
                            aria-hidden="true"
                            className="w-16 h-16 rounded-xl bg-indigo-100 overflow-hidden shrink-0 flex items-center justify-center text-indigo-900 font-black text-xl"
                        >
                            {post.cover_image_url ? (
                                <img src={post.cover_image_url} alt="" width="64" height="64" decoding="async" className="w-full h-full object-cover" />
                            ) : (
                                post.title.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base font-bold text-slate-900 truncate">
                                <Link
                                    href={`/dashboard/posts/${post.id}`}
                                    className="hover:text-indigo-800 truncate block cursor-pointer"
                                >
                                    {post.title}
                                </Link>
                            </h2>
                            <p className="text-sm text-slate-700 truncate">{post.excerpt || 'Tanpa ringkasan'}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                                <span className={`px-2 py-0.5 rounded-full border font-semibold ${categoryBadge(post.category)}`}>
                                    {post.category}
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded-full border font-semibold ${
                                        post.is_published
                                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                            : 'bg-amber-100 text-amber-900 border-amber-300'
                                    }`}
                                >
                                    {post.is_published ? 'Terpublikasi' : 'Draf'}
                                </span>
                                <span className="text-slate-700">{post.created_at}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => togglePublish(post)}
                            disabled={togglingId === post.id}
                            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer disabled:opacity-60"
                        >
                            {togglingId === post.id && <Spinner className="w-3.5 h-3.5" />}
                            <span>{post.is_published ? 'Jadikan Draf' : 'Publikasikan'}</span>
                        </button>
                        <KebabMenu post={post} onEdit={openEdit} onDelete={setDeleting} />
                    </div>
                ))}
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
                                link.active
                                    ? 'bg-indigo-700 text-white border-indigo-700'
                                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                            } disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* Full screen create/edit modal */}
            {formOpen && (
                <div className="fixed inset-0 z-[90] bg-white flex flex-col" role="dialog" aria-modal="true" aria-label={editing ? 'Ubah Artikel' : 'Tulis Artikel Baru'}>
                    <div className="bg-indigo-800 text-white px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold">{editing ? 'Ubah Artikel' : 'Tulis Artikel Baru'}</h2>
                        <button
                            type="button"
                            onClick={() => setFormOpen(false)}
                            className="text-2xl leading-none hover:text-indigo-200 cursor-pointer"
                            aria-label="Tutup modal"
                        >
                            ×
                        </button>
                    </div>
                    <form onSubmit={submitForm} className="flex-1 flex flex-col min-h-0">
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-4xl mx-auto space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="post-title">
                                        Judul
                                    </label>
                                    <input
                                        id="post-title"
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    />
                                    {errors.title && <p className="text-sm text-red-700 mt-1">{errors.title}</p>}
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="post-category">
                                            Kategori
                                        </label>
                                        <select
                                            id="post-category"
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 cursor-pointer"
                                        >
                                            {categories.map((c) => (
                                                <option key={c.value} value={c.value}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-sm text-red-700 mt-1">{errors.category}</p>}
                                    </div>
                                    <label htmlFor="post-is-published" className="flex items-center space-x-2 mt-7 cursor-pointer">
                                        <input
                                            id="post-is-published"
                                            type="checkbox"
                                            checked={form.is_published}
                                            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-slate-800">Publikasikan langsung</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="post-excerpt">
                                        Ringkasan
                                    </label>
                                    <textarea
                                        id="post-excerpt"
                                        rows={2}
                                        value={form.excerpt}
                                        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    />
                                    {errors.excerpt && <p className="text-sm text-red-700 mt-1">{errors.excerpt}</p>}
                                </div>
                                <div>
                                    <span className="block text-sm font-semibold text-slate-800 mb-1">Konten (Markdown)</span>
                                    <Suspense
                                        fallback={
                                            <textarea
                                                aria-label="Konten artikel dalam format Markdown"
                                                value={form.content}
                                                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                                                rows={10}
                                                className="w-full p-4 border border-slate-300 rounded-xl text-sm text-slate-900"
                                            />
                                        }
                                    >
                                        <MarkdownEditor
                                            key={editing ? `edit-${editing.id}` : 'create'}
                                            value={form.content}
                                            onChange={(md) => setForm((f) => ({ ...f, content: md }))}
                                            height="420px"
                                            placeholder="Tulis artikel Anda dalam format Markdown..."
                                        />
                                    </Suspense>
                                    {errors.content && <p className="text-sm text-red-700 mt-1">{errors.content}</p>}
                                </div>
                                {editing && (
                                    <div className="border border-slate-200 rounded-xl p-4">
                                        <p className="text-sm font-semibold text-slate-800 mb-2">Cover Artikel</p>
                                        {currentPost?.cover_image_url && (
                                            <img src={currentPost.cover_image_url} alt="Cover" width="400" height="225" decoding="async" className="h-32 rounded-lg object-cover mb-3" />
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => coverInput.current?.click()}
                                                disabled={coverBusy}
                                                className="px-3.5 py-2 text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer inline-flex items-center space-x-2 disabled:opacity-60"
                                            >
                                                {coverBusy && <Spinner />}
                                                <span>Unggah Cover</span>
                                            </button>
                                            {currentPost?.cover_image_url && (
                                                <button
                                                    type="button"
                                                    onClick={removeCover}
                                                    disabled={coverBusy}
                                                    className="px-3.5 py-2 text-sm font-semibold text-red-700 border border-red-300 rounded-lg hover:bg-red-50 cursor-pointer disabled:opacity-60"
                                                >
                                                    Hapus Cover
                                                </button>
                                            )}
                                            <input
                                                ref={coverInput}
                                                type="file"
                                                accept="image/*"
                                                aria-label="Unggah foto cover"
                                                className="hidden"
                                                onChange={uploadCover}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-100 border-t border-slate-300 px-6 py-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setFormOpen(false)}
                                className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold inline-flex items-center space-x-2 cursor-pointer disabled:opacity-60"
                            >
                                {saving && <Spinner />}
                                <span>Simpan</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete confirmation */}
            {deleting && (
                <div className="fixed inset-0 z-[90] bg-slate-900/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Konfirmasi Hapus Artikel">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold text-slate-900">Hapus Artikel?</h2>
                        <p className="mt-2 text-sm text-slate-700">Artikel &quot;{deleting.title}&quot; akan dihapus permanen.</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setDeleting(null)}
                                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm font-semibold cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleteBusy}
                                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-semibold inline-flex items-center space-x-2 cursor-pointer disabled:opacity-60"
                            >
                                {deleteBusy && <Spinner />}
                                <span>Hapus</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI generator modal */}
            {aiOpen && (
                <div className="fixed inset-0 z-[90] bg-slate-900/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Generator Artikel AI">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="bg-purple-800 text-white px-6 py-4 flex items-center justify-between">
                            <h2 className="font-bold">✨ Generator Artikel AI</h2>
                            <button
                                type="button"
                                onClick={() => setAiOpen(false)}
                                className="text-2xl leading-none cursor-pointer"
                                aria-label="Tutup modal AI"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <form onSubmit={generateAi} className="space-y-3">
                                <div>
                                    <label htmlFor="ai-prompt" className="block text-sm font-semibold text-slate-800 mb-1">
                                        Topik Artikel
                                    </label>
                                    <textarea
                                        id="ai-prompt"
                                        rows={3}
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="Contoh: manfaat belajar pemrograman web untuk pemula"
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    />
                                    {flash?.error && <p className="text-sm text-red-700 mt-1">{flash.error}</p>}
                                </div>
                                <div className="flex items-end gap-3">
                                    <div>
                                        <label htmlFor="ai-count" className="block text-sm font-semibold text-slate-800 mb-1">
                                            Jumlah Artikel
                                        </label>
                                        <input
                                            id="ai-count"
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={aiCount}
                                            onChange={(e) => setAiCount(e.target.value)}
                                            className="w-28 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={aiLoading}
                                        className="px-5 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-sm font-semibold inline-flex items-center space-x-2 cursor-pointer disabled:opacity-60"
                                    >
                                        {aiLoading && <Spinner />}
                                        <span>Generate</span>
                                    </button>
                                </div>
                            </form>

                            {aiItems.length > 0 && (
                                <div className="space-y-3">
                                    {aiItems.map((item, idx) => (
                                        <label key={idx} className="block border border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-50">
                                            <div className="flex items-start space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={item.selected}
                                                    onChange={(e) =>
                                                        setAiItems(aiItems.map((it, i) => (i === idx ? { ...it, selected: e.target.checked } : it)))
                                                    }
                                                    className="mt-1 w-4 h-4 cursor-pointer"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900">{item.title}</p>
                                                    <span
                                                        className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border font-semibold ${categoryBadge(
                                                            item.category
                                                        )}`}
                                                    >
                                                        {item.category}
                                                    </span>
                                                    <p className="text-sm text-slate-700 mt-1">{item.excerpt}</p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        {aiItems.length > 0 && (
                            <div className="bg-slate-100 border-t border-slate-300 px-6 py-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setAiItems([])}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={saveAi}
                                    disabled={aiSaving}
                                    className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold inline-flex items-center space-x-2 cursor-pointer disabled:opacity-60"
                                >
                                    {aiSaving && <Spinner />}
                                    <span>Simpan Artikel</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
