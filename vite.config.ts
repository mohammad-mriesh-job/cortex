import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Tutorial content (all markdown) is bundled for instant offline search,
    // which makes the main chunk legitimately large. Mermaid, KaTeX and the
    // page components are code-split via dynamic import / React.lazy.
    chunkSizeWarningLimit: 1600,
  },
})
