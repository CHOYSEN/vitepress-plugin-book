import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'client/index': resolve(__dirname, 'src/client/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'vitepress', 'vitepress/theme', 'vite'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    cssFileName: 'client/style',
    sourcemap: false,
  },
})
