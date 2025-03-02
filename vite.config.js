import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Production optimization
    rollupOptions: {
      input: 'public/index.html', // Explicit entry point
      output: {
        entryFileNames: 'assets/index-[hash].js', // Optimized for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Separate vendor for CDN
          }
        },
      },
    },
    target: 'esnext', // Modern browsers
    minify: 'esbuild', // Fast production minification
  },
  server: {
    port: 3000,
    open: false,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_API_ENDPOINT || 'https://your-api-lambda-endpoint.execute-api.us-east-1.amazonaws.com/prod',
        ws: true,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setupTests.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: ['src/**/*.{js,jsx}'],
      exclude: ['node_modules', 'cypress', '**/*.test.{js,jsx}'],
    },
  },
  envPrefix: 'VITE_',
  publicDir: 'public', // Explicit for Vercel
});
