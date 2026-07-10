import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
    resolve: {
        alias: {
            // react-helmet-async silently fails to commit head tags in this app;
            // route all imports to a dependency-free drop-in with the same API.
            'react-helmet-async': fileURLToPath(
                new URL('./src/lib/seo-helmet.jsx', import.meta.url)
            ),
        },
    },
    plugins: [
        react(),
        viteCompression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024,
            deleteOriginFile: false
        })
    ],
    server: {
        // PORT env lets tooling (preview harness) run a second instance on a
        // free port; defaults to the standard dev port.
        port: Number(process.env.PORT) || 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        assetsInlineLimit: 4096, // Inline assets smaller than 4KB
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'framer-motion': ['framer-motion'],
                    'ui-vendor': ['react-hot-toast'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
    },
});
