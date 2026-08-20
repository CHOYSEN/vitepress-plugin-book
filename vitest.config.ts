import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    alias: {
      vitepress: resolve(__dirname, 'test/__mocks__/vitepress.ts'),
      'vitepress/theme': resolve(__dirname, 'test/__mocks__/vitepress-theme.ts'),
    },
  },
});
