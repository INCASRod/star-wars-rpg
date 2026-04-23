import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/anthropic/, ''),
        configure: proxy => {
          proxy.on('proxyReq', proxyReq => {
            // Strip browser-origin headers so Anthropic treats this as a server request
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        },
      },
      '/api/fal': {
        target: 'https://fal.run',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/fal/, ''),
        configure: proxy => {
          proxy.on('proxyReq', proxyReq => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        },
      },
    },
  },
  build: { outDir: 'dist' },
})
