import React, { useEffect, useRef, useState } from 'react';

export default function MarkdownEditor({
    value = '',
    onChange,
    height = '300px',
    placeholder = 'Tuliskan deskripsi / catatan dalam format Markdown...',
}) {
    const editorElRef = useRef(null);
    const editorInstanceRef = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            import('@toast-ui/editor'),
            import('@toast-ui/editor/dist/toastui-editor.css'),
        ])
            .then(([mod]) => {
                if (cancelled || !editorElRef.current) return;
                const Editor = mod.default || mod;
                editorInstanceRef.current = new Editor({
                    el: editorElRef.current,
                    height: height,
                    initialEditType: 'markdown',
                    previewStyle: 'tab',
                    initialValue: value || '',
                    placeholder: placeholder,
                    usageStatistics: false,
                    events: {
                        change: () => {
                            if (editorInstanceRef.current && onChange) {
                                const md = editorInstanceRef.current.getMarkdown();
                                onChange(md);
                            }
                        },
                    },
                });
                setReady(true);
            })
            .catch(() => {
                // Keep fallback textarea interactive if chunk fails to load
            });

        return () => {
            cancelled = true;
            if (editorInstanceRef.current) {
                editorInstanceRef.current.destroy();
                editorInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (editorInstanceRef.current) {
            const current = editorInstanceRef.current.getMarkdown();
            if (value !== undefined && value !== current) {
                editorInstanceRef.current.setMarkdown(value || '', false);
            }
        }
    }, [value]);

    return (
        <div className="toastui-editor-container border border-slate-300 rounded-xl overflow-hidden bg-white">
            <div ref={editorElRef} />
            {!ready && (
                <textarea
                    aria-label="Konten artikel dalam format Markdown"
                    value={value || ''}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={10}
                    className="w-full p-4 text-sm text-slate-900 focus:outline-none"
                />
            )}
        </div>
    );
}
