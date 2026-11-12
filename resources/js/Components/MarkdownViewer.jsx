import React, { useMemo } from 'react';

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatInline(text) {
    let out = escapeHtml(text);
    // Inline code `code`
    out = out.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-mono text-sm">$1</code>');
    // Bold **text**
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    // Italic *text*
    out = out.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    // Links [label](url)
    out = out.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
        '<a href="$2" class="text-indigo-800 underline font-semibold hover:text-indigo-950" rel="noopener noreferrer">$1</a>'
    );
    return out;
}

function renderMarkdownToHtml(markdown) {
    if (!markdown) return '';
    const lines = String(markdown).replace(/\r\n/g, '\n').split('\n');
    const html = [];
    let inList = false;
    let listType = 'ul';
    let inCodeBlock = false;
    let codeBuffer = [];

    const closeList = () => {
        if (inList) {
            html.push(`</${listType}>`);
            inList = false;
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        if (trimmed.startsWith('```')) {
            closeList();
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeBuffer = [];
            } else {
                html.push(
                    `<pre class="my-4 p-4 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto text-sm font-mono"><code>${escapeHtml(
                        codeBuffer.join('\n')
                    )}</code></pre>`
                );
                inCodeBlock = false;
            }
            continue;
        }

        if (inCodeBlock) {
            codeBuffer.push(rawLine);
            continue;
        }

        if (trimmed === '') {
            closeList();
            continue;
        }

        if (/^---+$/.test(trimmed)) {
            closeList();
            html.push('<hr class="my-6 border-slate-200" />');
            continue;
        }

        if (trimmed.startsWith('### ')) {
            closeList();
            html.push(`<h3 class="mt-5 mb-2 text-lg font-bold text-slate-900">${formatInline(trimmed.slice(4))}</h3>`);
            continue;
        }

        if (trimmed.startsWith('## ')) {
            closeList();
            html.push(`<h2 class="mt-6 mb-3 text-xl font-extrabold text-slate-900">${formatInline(trimmed.slice(3))}</h2>`);
            continue;
        }

        if (trimmed.startsWith('# ')) {
            closeList();
            html.push(`<h2 class="mt-6 mb-3 text-2xl font-extrabold text-slate-900">${formatInline(trimmed.slice(2))}</h2>`);
            continue;
        }

        if (trimmed.startsWith('> ')) {
            closeList();
            html.push(
                `<blockquote class="my-4 pl-4 border-l-4 border-indigo-700 italic text-slate-700">${formatInline(
                    trimmed.slice(2)
                )}</blockquote>`
            );
            continue;
        }

        const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
        if (ulMatch) {
            if (!inList || listType !== 'ul') {
                closeList();
                inList = true;
                listType = 'ul';
                html.push('<ul class="my-3 list-disc list-inside space-y-1.5 text-slate-800">');
            }
            html.push(`<li>${formatInline(ulMatch[1])}</li>`);
            continue;
        }

        const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
        if (olMatch) {
            if (!inList || listType !== 'ol') {
                closeList();
                inList = true;
                listType = 'ol';
                html.push('<ol class="my-3 list-decimal list-inside space-y-1.5 text-slate-800">');
            }
            html.push(`<li>${formatInline(olMatch[1])}</li>`);
            continue;
        }

        closeList();
        html.push(`<p class="my-3 text-slate-800 leading-relaxed">${formatInline(trimmed)}</p>`);
    }

    closeList();
    if (inCodeBlock && codeBuffer.length > 0) {
        html.push(
            `<pre class="my-4 p-4 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto text-sm font-mono"><code>${escapeHtml(
                codeBuffer.join('\n')
            )}</code></pre>`
        );
    }

    return html.join('\n');
}

export default function MarkdownViewer({ content = '' }) {
    const rendered = useMemo(() => renderMarkdownToHtml(content), [content]);

    return (
        <div
            className="toastui-viewer-container prose prose-slate max-w-none text-slate-800"
            dangerouslySetInnerHTML={{ __html: rendered }}
        />
    );
}
