import React, { Suspense, lazy } from 'react';
import { Spinner } from './Feedback';

const MarkdownEditor = lazy(() => import('./MarkdownEditor'));

export default function PostFormModal({
    editing,
    currentPost,
    form,
    setForm,
    errors,
    categories,
    saving,
    coverBusy,
    coverInput,
    onClose,
    onSubmit,
    onUploadCover,
    onRemoveCover,
}) {
    return (
        <div
            className="fixed inset-0 z-[90] bg-white flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={editing ? 'Ubah Artikel' : 'Tulis Artikel Baru'}
        >
            <div className="bg-indigo-800 text-white px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? 'Ubah Artikel' : 'Tulis Artikel Baru'}</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-2xl leading-none hover:text-indigo-200 cursor-pointer"
                    aria-label="Tutup modal"
                >
                    ×
                </button>
            </div>
            <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
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
                                    <img
                                        src={currentPost.cover_image_url}
                                        alt="Cover"
                                        width="400"
                                        height="225"
                                        decoding="async"
                                        className="h-32 rounded-lg object-cover mb-3"
                                    />
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
                                            onClick={onRemoveCover}
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
                                        onChange={onUploadCover}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-slate-100 border-t border-slate-300 px-6 py-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
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
    );
}
