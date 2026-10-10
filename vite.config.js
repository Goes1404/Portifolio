import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Split the big libraries into their own long-cacheable chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion'
          if (id.includes('/gsap/') || id.includes('lenis')) return 'gsap'
          return undefined
        },
      },
    },
  },
})

