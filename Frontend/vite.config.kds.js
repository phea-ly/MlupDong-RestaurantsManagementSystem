import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const srcDir      = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [vue()],

  root: 'kds-entry',

  resolve: {
    alias: {
      '@': srcDir,
    },
  },

  server: {
    port: 6173,
    strictPort: true,
    fs: {
      allow: [projectRoot],
    },
    proxy: {
      '/api':     { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/storage': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },

  build: {
    rollupOptions: {
      input: fileURLToPath(new URL('./kds-entry/index.html', import.meta.url)),
    },
    outDir: '../dist-kds',
    emptyOutDir: true,
  },
})
