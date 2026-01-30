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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // ✅ React DOIT rester ensemble - ne pas séparer
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // ✅ React Router avec React
            if (id.includes('react-router')) {
              return 'vendor-react';
            }
            // Autres vendors
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('zod') || id.includes('react-hook-form')) {
              return 'vendor-forms';
            }
            if (id.includes('i18next')) {
              return 'vendor-i18n';
            }
            // ✅ Tout le reste dans un seul chunk
            return 'vendor-libs';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 500, // Augmenté un peu
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
});