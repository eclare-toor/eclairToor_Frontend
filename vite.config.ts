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
    // Minification aggressive avec Terser
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

    // Chunk splitting intelligent
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('zod')) {
              return 'vendor-forms';
            }
            if (id.includes('i18next')) {
              return 'vendor-i18n';
            }
            return 'vendor-misc';
          }
        },

        // Noms de fichiers avec hash pour le cache
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Taille max des chunks avant alerte
    chunkSizeWarningLimit: 400,

    // Désactive les sourcemaps en production pour la performance et la sécurité
    sourcemap: false,

    // Optimisations supplémentaires
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },

  // Optimisation du serveur de dev
  server: {
    hmr: {
      overlay: false,
    },
  },
});
