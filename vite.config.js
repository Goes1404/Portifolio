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
    // Split the animation libraries out of the app bundle. They're large and
    // change far less often than the portfolio content does, so a returning
    // visitor (or a recruiter opening the site a second time) re-downloads only
    // the small app chunk instead of ~190KB of gzipped vendor code.
    rollupOptions: {
      output: {
        // Function form: Vite 8's rolldown backend rejects the object form.
        // three.js is deliberately not listed — it must stay inside the lazily
        // imported webgl-hero chunk, which phones never fetch.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          if (/[\\/]gsap[\\/]/.test(id)) return 'gsap'
          if (/[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion'
        },
      },
    },
    // three.js only ever arrives via the lazily-imported WebGL blob, which
    // phones never request at all — keep the warning threshold above it so a
    // real regression in the main bundle isn't lost in a standing warning.
    chunkSizeWarningLimit: 600,
  },
})
