import React from 'react';
import { Spinner } from './Feedback';

export default function PostAiModal({
    aiPrompt,
    setAiPrompt,
    aiCount,
    setAiCount,
    aiLoading,
    aiSaving,
    aiItems,
    setAiItems,
    flashError,
    categoryBadge,
    onClose,
    onGenerate,
    onSave,
}) {
    return (
        <div
            className="fixed inset-0 z-[90] bg-slate-900/50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Generator Artikel AI"
        >
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                <div className="bg-purple-800 text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="font-bold">✨ Generator Artikel AI</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-2xl leading-none cursor-pointer"
                        aria-label="Tutup modal AI"
                    >
                        ×
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <form onSubmit={onGenerate} className="space-y-3">
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
                            {flashError && <p className="text-sm text-red-700 mt-1">{flashError}</p>}
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
                            onClick={onSave}
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
    );
}
