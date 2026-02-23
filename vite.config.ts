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
        // ربط التوكن الخاص بـ GitHub من Vercel
        'import.meta.env.VITE_GITHUB_TOKEN': JSON.stringify(env.VITE_GITHUB_TOKEN)
      },
      build: {
        emptyOutDir: true, // يمسح المجلد القديم لضمان نظافة الملفات
        sourcemap: false,
        // تحسين أداء البناء ومنع التخزين المؤقت القديم
        cssCodeSplit: true,
        rollupOptions: {
          output: {
            // استخدام توقيت عشوائي (Timestamp) لضمان أن كل ملف له اسم فريد تماماً
            entryFileNames: `assets/[name].[hash].${Date.now()}.js`,
            chunkFileNames: `assets/[name].[hash].${Date.now()}.js`,
            assetFileNames: `assets/[name].[hash].${Date.now()}.[ext]`
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
