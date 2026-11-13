import '../css/app.css';

const pages = import.meta.glob('./Pages/**/*.jsx');
const pause = (ms = 15) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
    // Step 1: Evaluasi React & ReactDOM dalam task tersendiri (< 45ms -> 0ms TBT)
    await pause(10);
    const [{ createElement }, { createRoot }] = await Promise.all([
        import('react'),
        import('react-dom/client'),
    ]);

    // Step 2: Evaluasi Inertia dalam task tersendiri (< 40ms -> 0ms TBT)
    await pause(15);
    const { createInertiaApp } = await import('@inertiajs/react');

    // Step 3: Load komponen halaman
    await pause(15);
    await createInertiaApp({
        title: (title) => (title ? `${title} - BlogVerse Pro` : 'BlogVerse Pro'),
        resolve: async (name) => {
            const importer = pages[`./Pages/${name}.jsx`];
            if (!importer) {
                throw new Error(`Page not found: ${name}`);
            }
            const mod = await importer();
            await pause(15);
            return mod.default || mod;
        },
        setup({ el, App, props }) {
            const root = createRoot(el);
            // Step 4: Render DOM React dalam task tersendiri (< 40ms -> 0ms TBT)
            setTimeout(() => {
                root.render(createElement(App, props));
            }, 15);
        },
        progress: {
            color: '#4f46e5',
        },
    });
})();
