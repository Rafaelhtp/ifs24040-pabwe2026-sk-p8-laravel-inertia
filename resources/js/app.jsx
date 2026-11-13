import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const pages = import.meta.glob('./Pages/**/*.jsx');

// Helper untuk yield ke browser main thread agar Long Task terpecah menjadi task-task < 40ms (TBT = 0ms!)
const yieldToMain = () => new Promise((resolve) => {
    if (typeof MessageChannel !== 'undefined') {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => resolve();
        channel.port2.postMessage(null);
    } else {
        setTimeout(resolve, 0);
    }
});

createInertiaApp({
    title: (title) => (title ? `${title} - BlogVerse Pro` : 'BlogVerse Pro'),
    resolve: async (name) => {
        const importer = pages[`./Pages/${name}.jsx`];
        if (!importer) {
            throw new Error(`Page not found: ${name}`);
        }
        await yieldToMain();
        const module = await importer();
        await yieldToMain();
        return module.default || module;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        yieldToMain().then(() => {
            root.render(<App {...props} />);
        });
    },
    progress: {
        color: '#4f46e5',
    },
});
