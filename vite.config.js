import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const norm = id.replace(/\\/g, '/');
                    if (
                        norm.includes('@toast-ui') ||
                        norm.includes('prosemirror') ||
                        norm.includes('dompurify') ||
                        norm.includes('linkify') ||
                        norm.includes('toastmark') ||
                        norm.includes('orderedmap') ||
                        norm.includes('rope-sequence') ||
                        norm.includes('w3c-keyname') ||
                        norm.includes('crelt') ||
                        norm.includes('squire-rte') ||
                        norm.includes('mdurl') ||
                        norm.includes('uc.micro') ||
                        norm.includes('entities')
                    ) {
                        return 'toastui';
                    }
                    if (norm.includes('node_modules/react') || norm.includes('node_modules/scheduler')) {
                        return 'vendor-react';
                    }
                    if (norm.includes('node_modules/@inertiajs') || norm.includes('node_modules/axios') || norm.includes('node_modules/lodash')) {
                        return 'vendor-inertia';
                    }
                },
            },
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
