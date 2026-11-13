import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    build: {
        sourcemap: true,
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
                    if (norm.includes('react-dom') || norm.includes('/react/') || norm.includes('scheduler')) {
                        return 'vendor-react';
                    }
                    if (norm.includes('axios')) {
                        return 'vendor-axios';
                    }
                    if (
                        norm.includes('lodash') ||
                        norm.includes('/qs/') ||
                        norm.includes('side-channel') ||
                        norm.includes('get-intrinsic') ||
                        norm.includes('object-inspect') ||
                        norm.includes('call-bind') ||
                        norm.includes('es-errors') ||
                        norm.includes('math-intrinsics') ||
                        norm.includes('@inertiajs') ||
                        norm.includes('laravel-precognition')
                    ) {
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
