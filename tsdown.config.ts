import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: ['./src/index.ts', './src/client/index.ts'],
  format: ['esm'],
  platform: 'neutral',
  deps: { neverBundle: ['vue', 'vitepress', 'vitepress/theme', 'vite'] },
  plugins: [Vue({ isProduction: true })],
  dts: false,
  clean: true,
  outDir: 'dist',
})
