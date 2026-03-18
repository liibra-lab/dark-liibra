import { defineConfig } from 'vite';

export default defineConfig({
  base: '/dark/',   // matches liibra.com.br/dark
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
