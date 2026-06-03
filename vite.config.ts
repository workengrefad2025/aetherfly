import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@supabase/')) return 'supabase';
              if (id.includes('recharts')) return 'charts';
              if (id.includes('motion')) return 'motion';
              if (id.includes('lucide-react')) return 'icons';
              if (id.includes('redux') || id.includes('react-redux') || id.includes('@reduxjs/toolkit') || id.includes('use-sync-external-store')) return 'redux-vendor';
              return 'vendor';
            }
            if (id.includes('/src/components/DashboardAnalyticsCharts')) return 'dashboard-charts';
            if (id.includes('/src/components/Dashboard.tsx')) return 'dashboard-shell';
            if (id.includes('/src/services/flightService.ts')) return 'flight-service';
          }
        }
      }
    }
  };
});
