import '../css/app.css';
import { startTransition } from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'BlogVerse Pro';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page = pages[`./Pages/${name}.jsx`];
        if (!page) {
            throw new Error(`Page ${name} not found`);
        }
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        const mount = () => {
            startTransition(() => {
                root.render(<App {...props} />);
            });
        };

        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(() => {
                startTransition(() => {
                    root.render(<App {...props} />);
                });
            });
        } else {
            mount();
        }
    },
    progress: {
        color: '#4338ca',
    },
});
