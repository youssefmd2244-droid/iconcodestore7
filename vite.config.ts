import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // السطر المضاف لربط GitHub
        'import.meta.env.VITE_GITHUB_TOKEN': JSON.stringify(env.VITE_GITHUB_TOKEN)
      },
      // --- إضافة إعدادات إجبار التحديث لكل الملفات ---
      build: {
        emptyOutDir: true, // يمسح النسخة القديمة تماماً قبل بناء الجديدة
        sourcemap: false,
        rollupOptions: {
          output: {
            // يضيف رقم متغير لكل ملف لضمان عدم تخزينه في المتصفح
            entryFileNames: `[name]-[hash].js`,
            chunkFileNames: `[name]-[hash].js`,
            assetFileNames: `[name]-[hash].[ext]`
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
