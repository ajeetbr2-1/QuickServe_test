import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    // Root directory
    root: '.',

    // Build configuration
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                complete: resolve(__dirname, 'complete-marketplace.html')
            }
        },
        // Generate source maps for debugging
        sourcemap: true,
        // Minify for production
        minify: 'esbuild'
    },

    // Development server configuration
    server: {
        port: 8000,
        host: true,
        open: true,
        cors: true
    },

    // Asset handling
    publicDir: 'assets',

    // CSS configuration
    css: {
        postcss: './postcss.config.js'
    },

    // Optimizations
    optimizeDeps: {
        include: ['font-awesome']
    },

    // Plugin configuration
    plugins: [],

    // Base URL for deployment
    base: './'
})